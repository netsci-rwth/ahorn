export type ResolvedAttachment = {
  url: string;
  size?: number;
};

type AttachmentMap = Record<string, string>;

type ZenodoFile = {
  key?: string;
  size?: number;
};

type ZenodoRecordResponse = {
  files?: ZenodoFile[];
};

const zenodoRecordCache = new Map<string, Promise<Map<string, number>>>();

function isZenodoUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return /(^|\.)zenodo\.org$/i.test(parsedUrl.hostname);
  } catch {
    return false;
  }
}

function parseZenodoFileUrl(url: string): {
  recordId: string;
  filename: string;
} {
  const parsedUrl = new URL(url);

  if (!/(^|\.)zenodo\.org$/i.test(parsedUrl.hostname)) {
    throw new Error(`Expected a Zenodo URL, received: ${url}`);
  }

  const [, recordsSegment, recordId, filesSegment, ...rest] =
    parsedUrl.pathname.split("/");
  if (recordsSegment !== "records" || filesSegment !== "files" || !recordId) {
    throw new Error(`Invalid Zenodo file URL: ${url}`);
  }

  const filename = rest.at(-1);
  if (!filename) {
    throw new Error(`Missing filename in Zenodo URL: ${url}`);
  }

  return {
    recordId,
    filename: decodeURIComponent(filename),
  };
}

async function getZenodoRecordFiles(
  recordId: string,
): Promise<Map<string, number>> {
  let recordPromise = zenodoRecordCache.get(recordId);
  if (!recordPromise) {
    recordPromise = fetch(`https://zenodo.org/api/records/${recordId}`).then(
      async (response) => {
        if (!response.ok) {
          throw new Error(`Zenodo record ${recordId} request failed`);
        }

        const payload = (await response.json()) as ZenodoRecordResponse;
        return new Map(
          (payload.files || [])
            .filter(
              (file): file is Required<Pick<ZenodoFile, "key" | "size">> =>
                typeof file.key === "string" && typeof file.size === "number",
            )
            .map((file) => [file.key, file.size]),
        );
      },
    );

    zenodoRecordCache.set(recordId, recordPromise);
  }

  return recordPromise;
}

export async function resolveAttachmentSizes(
  attachments: AttachmentMap,
): Promise<Record<string, ResolvedAttachment>> {
  const resolvedEntries = await Promise.all(
    Object.entries(attachments).map(async ([key, attachment]) => {
      const resolvedAttachment = { url: attachment };
      if (!isZenodoUrl(attachment)) {
        return [key, resolvedAttachment] as const;
      }

      const zenodoFile = parseZenodoFileUrl(attachment);

      try {
        const files = await getZenodoRecordFiles(zenodoFile.recordId);
        const size = files.get(zenodoFile.filename);

        if (typeof size === "number") {
          return [key, { ...resolvedAttachment, size }] as const;
        }
      } catch {}

      return [key, resolvedAttachment] as const;
    }),
  );

  return Object.fromEntries(resolvedEntries);
}
