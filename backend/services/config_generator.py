import re


def derive_id_from_interfaces(interfaces: list[str]) -> int | None:
    """Parse interface names, find lowest-numbered, string-concat module+port.

    Eth1/12 -> 112, Eth2/5 -> 25, Eth1/1 -> 11
    """
    parsed = []
    for iface in interfaces:
        match = re.match(r"(?:Ethernet|Eth)\s*(\d+)/(\d+)", iface, re.IGNORECASE)
        if match:
            module, port = int(match.group(1)), int(match.group(2))
            parsed.append((module, port))
    if not parsed:
        return None
    parsed.sort()
    lowest = parsed[0]
    return int(f"{lowest[0]}{lowest[1]}")


def canonicalize_interface(name: str) -> str:
    """Eth1/12 -> Ethernet1/12"""
    match = re.match(r"(?:Ethernet|Eth)\s*(\d+)/(\d+)", name, re.IGNORECASE)
    if match:
        return f"Ethernet{match.group(1)}/{match.group(2)}"
    return name


def generate_switch_config(
    switch_side: str,
    connection_groups: list,
    switch_name: str = "",
) -> str:
    """Generate NX-OS config for one switch.

    Args:
        switch_side: "A" or "B"
        connection_groups: list of ConnectionGroupRead objects
        switch_name: display name for the switch
    """
    lines = []
    label = switch_name or f"Switch-{switch_side}"
    lines.append(f"! {label}")
    lines.append("")
    for cg in connection_groups:
        interfaces = cg.switch_a_interfaces if switch_side == "A" else cg.switch_b_interfaces
        if not interfaces:
            continue

        ch_group = cg.effective_channel_group
        vpc_id = cg.effective_vpc_id
        desc = cg.description
        vlans = cg.trunk_vlans

        if ch_group is None:
            continue

        for iface in sorted(interfaces):
            canonical = canonicalize_interface(iface)
            lines.append(f"interface {canonical}")
            if desc:
                lines.append(f"  description {desc}")
            lines.append("  switchport mode trunk")
            if vlans:
                lines.append(f"  switchport trunk allowed vlan {vlans}")
            lines.append(f"  channel-group {ch_group} mode active")
            lines.append("  no shutdown")
            lines.append("")

        lines.append(f"interface port-channel{ch_group}")
        if desc:
            lines.append(f"  description {desc}")
        lines.append("  switchport mode trunk")
        if vlans:
            lines.append(f"  switchport trunk allowed vlan {vlans}")
        lines.append(f"  vpc {vpc_id}")
        lines.append("  no shutdown")
        lines.append("")

    return "\n".join(lines)
