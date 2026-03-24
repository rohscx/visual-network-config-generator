import re

from ..models import ValidationError as VError


def validate_topology(connection_groups: list, hosts_by_id: dict) -> list[VError]:
    """Validate a topology's connection groups. Returns list of validation errors."""
    errors = []

    vpc_ids: dict[int, list[str]] = {}
    ch_groups: dict[int, list[str]] = {}
    interface_usage: dict[tuple[str, str], list[str]] = {}  # (side, iface) -> [host_names]

    for cg in connection_groups:
        host_name = hosts_by_id.get(cg.host_id, cg.host_id)
        eff_vpc = cg.effective_vpc_id
        eff_ch = cg.effective_channel_group

        # Check for unparseable interfaces
        all_ifaces = cg.switch_a_interfaces + cg.switch_b_interfaces
        for iface in all_ifaces:
            if not re.match(r"(?:Ethernet|Eth)\s*\d+/\d+", iface, re.IGNORECASE):
                errors.append(VError(
                    level="warning",
                    message=f"Interface '{iface}' on host '{host_name}' doesn't match expected format (e.g., Eth1/1)",
                    related_host=host_name,
                ))

        # Track vPC IDs
        if eff_vpc is not None:
            vpc_ids.setdefault(eff_vpc, []).append(host_name)

        # Track channel-groups
        if eff_ch is not None:
            ch_groups.setdefault(eff_ch, []).append(host_name)

        # Track interface usage
        for iface in cg.switch_a_interfaces:
            normalized = iface.strip().lower()
            interface_usage.setdefault(("A", normalized), []).append(host_name)
        for iface in cg.switch_b_interfaces:
            normalized = iface.strip().lower()
            interface_usage.setdefault(("B", normalized), []).append(host_name)

        # Missing interfaces
        if not cg.switch_a_interfaces and not cg.switch_b_interfaces:
            errors.append(VError(
                level="warning",
                message=f"Host '{host_name}' has no interfaces assigned on either switch",
                related_host=host_name,
            ))
        elif not cg.switch_a_interfaces:
            errors.append(VError(
                level="warning",
                message=f"Host '{host_name}' has no interfaces on Switch A",
                related_host=host_name,
            ))
        elif not cg.switch_b_interfaces:
            errors.append(VError(
                level="warning",
                message=f"Host '{host_name}' has no interfaces on Switch B",
                related_host=host_name,
            ))

        # Empty description
        if not cg.description.strip():
            errors.append(VError(
                level="warning",
                message=f"Host '{host_name}' has no description",
                related_host=host_name,
            ))

        # No VLANs
        if not cg.trunk_vlans.strip():
            errors.append(VError(
                level="warning",
                message=f"Host '{host_name}' has no trunk VLANs specified",
                related_host=host_name,
            ))

    # Duplicate vPC IDs
    for vpc_id, hosts in vpc_ids.items():
        if len(hosts) > 1:
            errors.append(VError(
                level="error",
                message=f"Duplicate vPC ID {vpc_id} used by hosts: {', '.join(hosts)}",
            ))

    # Duplicate channel-groups
    for ch, hosts in ch_groups.items():
        if len(hosts) > 1:
            errors.append(VError(
                level="error",
                message=f"Duplicate channel-group {ch} used by hosts: {', '.join(hosts)}",
            ))

    # Interface assigned to multiple hosts
    for (side, iface), hosts in interface_usage.items():
        if len(hosts) > 1:
            switch_label = f"Switch {'A' if side == 'A' else 'B'}"
            errors.append(VError(
                level="error",
                message=f"Interface '{iface}' on {switch_label} assigned to multiple hosts: {', '.join(hosts)}",
            ))

    return errors
