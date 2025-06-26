"""Utility scripts for handling YAML data."""

import yaml


def patch_dumper() -> None:
    """Patch the YAML dumper to handle multiline strings."""
    yaml.Dumper.org_represent_str = yaml.Dumper.represent_str

    def repr_str(dumper, data):
        if "\n" in data:
            return dumper.represent_scalar("tag:yaml.org,2002:str", data, style="|")
        return dumper.org_represent_str(data)

    yaml.add_representer(str, repr_str, Dumper=yaml.Dumper)
