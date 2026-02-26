"""Lint dataset frontmatter for required fields and ordering."""

# /// script
# requires-python = ">= 3.13"
# dependencies = [
#     "pyyaml",
# ]
# ///

from dataclasses import dataclass
from pathlib import Path
from typing import TYPE_CHECKING, Any
from urllib.parse import urlparse

import yaml

if TYPE_CHECKING:
    from collections.abc import Hashable, Iterable, Sequence

FRONTMATTER_DELIMITER = "---"

REQUIRED_FIELDS = ("title", "source", "network-type")
FIELD_ORDER: tuple[Hashable, ...] = (
    "title",
    "disable",
    "source",
    "license",
    "citation",
    "network-type",
    "tags",
    "related",
    "attachments",
    "statistics",
    "label-count",
    "edge-label-count",
    "shape",
)
NETWORK_TYPE_ORDER = (
    "simplicial-complex",
    "cell-complex",
    "combinatorial-complex",
    "hypergraph",
)


@dataclass(frozen=True)
class FrontmatterIssue:
    """A frontmatter linting issue found in a datasheet file.

    Attributes
    ----------
    path : Path
        The path to the datasheet file where the issue was found.
    line : int
        The line number where the issue occurs.
    message : str
        A description of the issue.
    """

    path: Path
    line: int
    message: str


def extract_frontmatter(
    text: str,
    path: Path,
) -> tuple[dict[Hashable, Any] | None, int, list[FrontmatterIssue]]:
    """Extract and parse frontmatter from file content using PyYAML.

    Parameters
    ----------
    text : str
        The file content.
    path : Path
        The file path (for error reporting).

    Returns
    -------
    frontmatter : dict | None
        The parsed frontmatter as a dictionary, or None if parsing failed.
    end_line : int
        The line number where the frontmatter block ends (after the closing delimiter).
    issues : list[FrontmatterIssue]
        A list of any issues encountered during parsing.
    """
    issues: list[FrontmatterIssue] = []
    lines = text.splitlines()

    if not lines or lines[0].strip() != FRONTMATTER_DELIMITER:
        issues.append(
            FrontmatterIssue(
                path=path,
                line=1,
                message="Missing frontmatter block at top of file.",
            )
        )
        return None, 0, issues

    end_index = None
    for index in range(1, len(lines)):
        if lines[index].strip() == FRONTMATTER_DELIMITER:
            end_index = index
            break

    if end_index is None:
        issues.append(
            FrontmatterIssue(
                path=path,
                line=1,
                message="Unterminated frontmatter block.",
            )
        )
        return None, 0, issues

    frontmatter_text = "\n".join(lines[1:end_index])
    try:
        data = yaml.safe_load(frontmatter_text)
        # Ensure we got a dict
        if not isinstance(data, dict):
            data = {}
    except yaml.YAMLError as e:
        issues.append(
            FrontmatterIssue(
                path=path,
                line=2 + e.problem_mark.line if hasattr(e, "problem_mark") else 2,
                message=f"Invalid YAML: {e}",
            )
        )
        return None, end_index, issues

    return data, end_index, issues


def lint_file(path: Path) -> list[FrontmatterIssue]:
    """Lint a single dataset file for frontmatter issues.

    Parameters
    ----------
    path : Path
        The file path to lint.

    Returns
    -------
    list[FrontmatterIssue]
        A list of all linting issues found in the file.
    """
    issues: list[FrontmatterIssue] = []
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines()

    data, frontmatter_end, parse_issues = extract_frontmatter(text, path)
    issues.extend(parse_issues)

    if data is None:
        return issues

    # Check for required fields
    key_names = list(data.keys()) if data else []
    missing_required = [key for key in REQUIRED_FIELDS if key not in key_names]
    issues.extend(
        FrontmatterIssue(path=path, line=1, message=f"Missing required key '{key}'.")
        for key in missing_required
    )

    # Function to find approximate line numbers for keys
    def find_key_line(key: Hashable) -> int:
        """Find the approximate line number for a key in the frontmatter."""
        for i, line in enumerate(lines[1:frontmatter_end], start=2):
            if line.strip().startswith(f"{key}:"):
                return i
        return 2  # Default to first line after opening delimiter

    def is_full_url(value: str) -> bool:
        """Return True when the value looks like an absolute https URL."""
        parsed = urlparse(value)
        return parsed.scheme == "https" and bool(parsed.netloc)

    # Check field ordering
    order_map = {key: index for index, key in enumerate(FIELD_ORDER)}
    last_index = -1
    last_key = None
    for key in key_names:
        if order_map.get(key) is None:
            continue
        index = order_map[key]
        if index < last_index:
            line = find_key_line(key)
            expected_after = last_key or "start of frontmatter"
            issues.append(
                FrontmatterIssue(
                    path=path,
                    line=line,
                    message=(
                        f"Key '{key}' is out of order; expected before '{expected_after}'."
                    ),
                )
            )
        else:
            last_index = index
            last_key = key

    # Check network-type field
    if "network-type" in data:
        network_values = data["network-type"]

        # Ensure it's a list
        if not isinstance(network_values, list):
            line = find_key_line("network-type")
            issues.append(
                FrontmatterIssue(
                    path=path,
                    line=line,
                    message="Key 'network-type' must be a list of values.",
                )
            )
        elif not network_values:
            line = find_key_line("network-type")
            issues.append(
                FrontmatterIssue(
                    path=path,
                    line=line,
                    message="Key 'network-type' must list at least one value.",
                )
            )
        else:
            order_map = {value: index for index, value in enumerate(NETWORK_TYPE_ORDER)}
            last_index = -1
            last_value = None
            for value in network_values:
                if value not in NETWORK_TYPE_ORDER:
                    allowed = ", ".join(NETWORK_TYPE_ORDER)
                    line = find_key_line("network-type")
                    issues.append(
                        FrontmatterIssue(
                            path=path,
                            line=line,
                            message=(
                                f"Invalid network-type '{value}'. Allowed values: {allowed}."
                            ),
                        )
                    )
                    continue
                index = order_map[value]
                if index < last_index:
                    expected_after = last_value or "start of list"
                    line = find_key_line("network-type")
                    issues.append(
                        FrontmatterIssue(
                            path=path,
                            line=line,
                            message=(
                                "Network-type values must follow the predefined order; "
                                f"'{value}' should appear after '{expected_after}'."
                            ),
                        )
                    )
                else:
                    last_index = index
                    last_value = value

    # Check attachments for revision fields
    if "attachments" in data:
        attachments = data["attachments"]
        attachments_line = find_key_line("attachments")
        if not isinstance(attachments, dict):
            issues.append(
                FrontmatterIssue(
                    path=path,
                    line=attachments_line,
                    message="attachments must be a mapping of attachment entries.",
                )
            )
        else:
            for attachment_key, attachment in attachments.items():
                if not isinstance(attachment, dict):
                    issues.append(
                        FrontmatterIssue(
                            path=path,
                            line=attachments_line,
                            message=("Each attachments entry must be a mapping."),
                        )
                    )
                    continue

                if "url" not in attachment:
                    issues.append(
                        FrontmatterIssue(
                            path=path,
                            line=attachments_line,
                            message=("Each attachment must include an 'url' field."),
                        )
                    )
                    continue

                # Check that URL is valid for all attachments
                url_value = attachment.get("url")
                if not isinstance(url_value, str) or not is_full_url(url_value):
                    issues.append(
                        FrontmatterIssue(
                            path=path,
                            line=attachments_line,
                            message=f"attachments.{attachment_key}.url must be a full https URL.",
                        )
                    )

            # Check for revision fields (revision-1, revision-2, etc.)
            revision_keys = [key for key in attachments if key.startswith("revision-")]

            if not revision_keys:
                issues.append(
                    FrontmatterIssue(
                        path=path,
                        line=attachments_line,
                        message=(
                            "Attachments must include at least one revision entry (e.g., revision-1)."
                        ),
                    )
                )
            else:
                # Extract revision numbers and check they are consecutive starting from 1
                revision_numbers = []
                for key in revision_keys:
                    try:
                        num = int(key.split("-")[1])
                        revision_numbers.append(num)
                    except IndexError, ValueError:
                        issues.append(
                            FrontmatterIssue(
                                path=path,
                                line=attachments_line,
                                message=f"Invalid revision key format: '{key}'. Expected format: revision-N where N is a number.",
                            )
                        )

                if revision_numbers:
                    revision_numbers.sort()
                    # Check that revisions start at 1
                    if revision_numbers[0] != 1:
                        issues.append(
                            FrontmatterIssue(
                                path=path,
                                line=attachments_line,
                                message="Revisions must start with revision-1.",
                            )
                        )

                    # Check that revisions are consecutive
                    expected = list(range(1, len(revision_numbers) + 1))
                    if revision_numbers != expected:
                        issues.append(
                            FrontmatterIssue(
                                path=path,
                                line=attachments_line,
                                message=f"Revisions must be consecutive. Found: {revision_numbers}, expected: {expected}.",
                            )
                        )

    return issues


def lint_files(paths: Iterable[Path]) -> list[FrontmatterIssue]:
    """Lint multiple dataset files for frontmatter issues.

    Parameters
    ----------
    paths : Iterable[Path]
        The file paths to lint.

    Returns
    -------
    list[FrontmatterIssue]
        A list of all linting issues found across all files.
    """
    issues: list[FrontmatterIssue] = []
    for path in paths:
        issues.extend(lint_file(path=path))
    return issues


def render_issues(issues: Sequence[FrontmatterIssue]) -> None:
    """Render frontmatter linting issues in a formatted table.

    Parameters
    ----------
    issues : Sequence[FrontmatterIssue]
        The linting issues to display.
    """
    print(f"Found {len(issues)} frontmatter issue(s):")

    for issue in sorted(issues, key=lambda item: (str(item.path), item.line, item.message)):
        print(f"{issue.path}:{issue.line}: {issue.message}")


if __name__ == "__main__":
    from argparse import ArgumentParser

    repo_root = Path(__file__).resolve().parents[1]

    parser = ArgumentParser(
        description="Lint datasheets for common errors and consistent style."
    )
    parser.add_argument(
        "files",
        nargs="*",
        type=Path,
        default=repo_root.glob("src/datasets/**/*.mdx"),
        help="Specific dataset files to lint (defaults to all in src/datasets).",
    )

    issues = lint_files(parser.parse_args().files)
    if issues:
        render_issues(issues)
        raise SystemExit(1)
