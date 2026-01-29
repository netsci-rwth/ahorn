"""Utility scripts for handling YAML data."""

import re
from typing import Any

import yaml


class Dumper(yaml.Dumper):
    """Custom YAML dumper that fixes indentation of lists.

    See this StackOverflow post for more details:
    https://stackoverflow.com/questions/25108581/python-yaml-dump-bad-indentation
    """

    def increase_indent(self, flow: bool = False, *args: Any, **kwargs: Any) -> None:  # noqa: D102
        return super().increase_indent(flow=flow, indentless=False)


def patch_dumper() -> None:
    """Patch the YAML dumper to handle multiline strings."""
    yaml.Dumper.org_represent_str = yaml.Dumper.represent_str

    def repr_str(dumper: yaml.Dumper, data: str) -> Any:
        if "\n" in data:
            return dumper.represent_scalar("tag:yaml.org,2002:str", data, style="|")
        return dumper.org_represent_str(data)

    yaml.add_representer(str, repr_str, Dumper=yaml.Dumper)
    yaml.add_representer(str, repr_str, Dumper=Dumper)


def read_frontmatter(markdown: str) -> tuple[dict[str, Any], str]:
    """Read the frontmatter from a markdown string.

    Parameters
    ----------
    markdown : str
        The markdown content as a string.

    Returns
    -------
    frontmatter : dict
        The frontmatter as a dictionary.
    body : str
        The body of the markdown content.
    """
    frontmatter_match = re.match(r"---\n(.*?)\n---\n(.*)", markdown, re.DOTALL)
    if frontmatter_match:
        frontmatter = yaml.safe_load(frontmatter_match.group(1))
        body = frontmatter_match.group(2)

        if not isinstance(body, str):
            body = ""
    else:
        frontmatter = {}
        body = markdown

    return frontmatter, body
