export type RevisionFormat = `revision-${number}`;
export type AttachmentFormat = "ahorn" | (string & {});

export type ResolvedAttachment = {
  url: string;
  size?: number;
};

export type AttachmentMetadata = {
  ahorn: string;
  hif?: string;
  changelog?: string[];
  [format: string]: string | string[] | undefined;
};

export type AttachmentMap = Record<RevisionFormat, AttachmentMetadata>;

export type ResolvedRevisionAttachment = {
  ahorn: ResolvedAttachment;
  hif?: ResolvedAttachment;
  changelog: string[];
  [format: string]: ResolvedAttachment | string[] | undefined;
};

type ZenodoFile = {
  key?: string;
  size?: number;
};

type ZenodoRecordResponse = {
  files?: ZenodoFile[];
};

const zenodoRecordCache = new Map<string, Promise<Map<string, number>>>();

export function isAttachmentFormat(key: string): key is AttachmentFormat {
  return key !== "changelog";
}

export function getAttachmentFormatEntries(
  attachment: AttachmentMetadata,
): [AttachmentFormat, string][] {
  return Object.entries(attachment).filter(
    (entry): entry is [AttachmentFormat, string] =>
      isAttachmentFormat(entry[0]) && typeof entry[1] === "string",
  );
}

export function getResolvedAttachmentFormatEntries(
  attachment: ResolvedRevisionAttachment,
): [AttachmentFormat, ResolvedAttachment][] {
  return Object.entries(attachment).filter(
    (entry): entry is [AttachmentFormat, ResolvedAttachment] =>
      isAttachmentFormat(entry[0]) &&
      typeof entry[1] === "object" &&
      entry[1] !== null &&
      !Array.isArray(entry[1]) &&
      typeof entry[1].url === "string",
  );
}

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
): Promise<Record<RevisionFormat, ResolvedRevisionAttachment>> {
  const resolvedEntries = await Promise.all(
    Object.entries(attachments).map(async ([key, attachment]) => {
      const resolvedFormats = await Promise.all(
        getAttachmentFormatEntries(attachment).map(async ([format, url]) => {
          const resolvedAttachment = await resolveOneAttachment(url);
          return [format, resolvedAttachment] as const;
        }),
      );

      return [
        key,
        {
          ...Object.fromEntries(resolvedFormats),
          changelog: attachment.changelog ?? [],
        } as ResolvedRevisionAttachment,
      ] as const;
    }),
  );

  return Object.fromEntries(resolvedEntries);
}

async function resolveOneAttachment(url: string): Promise<ResolvedAttachment> {
  const resolvedAttachment = { url };
  if (!isZenodoUrl(url)) {
    return resolvedAttachment;
  }

  const zenodoFile = parseZenodoFileUrl(url);

  try {
    const files = await getZenodoRecordFiles(zenodoFile.recordId);
    const size = files.get(zenodoFile.filename);

    return { url, size };
  } catch {}

  return { url, size: undefined };
}
