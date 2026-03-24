import json
import uuid
from datetime import datetime, timezone

from .database import get_connection
from .models import (
    ConnectionGroupCreate,
    ConnectionGroupRead,
    HostCreate,
    HostRead,
    TopologyRead,
    TopologySave,
    TopologySummary,
)
from .services.config_generator import derive_id_from_interfaces


def _build_connection_group_read(row) -> ConnectionGroupRead:
    switch_a = json.loads(row["switch_a_interfaces"])
    switch_b = json.loads(row["switch_b_interfaces"])
    all_interfaces = switch_a + switch_b
    derived = derive_id_from_interfaces(all_interfaces)

    return ConnectionGroupRead(
        id=row["id"],
        topology_id=row["topology_id"],
        host_id=row["host_id"],
        description=row["description"],
        trunk_vlans=row["trunk_vlans"],
        channel_group=row["channel_group"],
        vpc_id=row["vpc_id"],
        switch_a_interfaces=switch_a,
        switch_b_interfaces=switch_b,
        effective_channel_group=row["channel_group"] if row["channel_group"] is not None else derived,
        effective_vpc_id=row["vpc_id"] if row["vpc_id"] is not None else derived,
    )


def list_topologies() -> list[TopologySummary]:
    conn = get_connection()
    rows = conn.execute(
        "SELECT id, name, updated_at FROM topology ORDER BY updated_at DESC"
    ).fetchall()
    conn.close()
    return [TopologySummary(id=r["id"], name=r["name"], updated_at=r["updated_at"]) for r in rows]


def get_topology(topology_id: str) -> TopologyRead | None:
    conn = get_connection()
    row = conn.execute("SELECT * FROM topology WHERE id = ?", (topology_id,)).fetchone()
    if not row:
        conn.close()
        return None

    host_rows = conn.execute(
        "SELECT * FROM host WHERE topology_id = ?", (topology_id,)
    ).fetchall()

    cg_rows = conn.execute(
        "SELECT * FROM connection_group WHERE topology_id = ?", (topology_id,)
    ).fetchall()
    conn.close()

    cg_by_host = {}
    for cg_row in cg_rows:
        cg_by_host[cg_row["host_id"]] = _build_connection_group_read(cg_row)

    hosts = []
    for h in host_rows:
        hosts.append(HostRead(
            id=h["id"],
            topology_id=h["topology_id"],
            name=h["name"],
            position_x=h["position_x"],
            position_y=h["position_y"],
            connection_group=cg_by_host.get(h["id"]),
        ))

    return TopologyRead(
        id=row["id"],
        name=row["name"],
        switch_a_name=row["switch_a_name"],
        switch_b_name=row["switch_b_name"],
        canvas_state=json.loads(row["canvas_state"]),
        created_at=row["created_at"],
        updated_at=row["updated_at"],
        hosts=hosts,
    )


def save_topology(topology_id: str | None, data: TopologySave) -> TopologyRead:
    conn = get_connection()
    now = datetime.now(timezone.utc).isoformat()

    if topology_id is None:
        topology_id = str(uuid.uuid4())
        conn.execute(
            "INSERT INTO topology (id, name, switch_a_name, switch_b_name, canvas_state, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (topology_id, data.name, data.switch_a_name, data.switch_b_name, json.dumps(data.canvas_state), now, now),
        )
    else:
        existing = conn.execute("SELECT id FROM topology WHERE id = ?", (topology_id,)).fetchone()
        if not existing:
            conn.close()
            return None
        conn.execute("DELETE FROM host WHERE topology_id = ?", (topology_id,))
        conn.execute("DELETE FROM connection_group WHERE topology_id = ?", (topology_id,))
        conn.execute(
            "UPDATE topology SET name=?, switch_a_name=?, switch_b_name=?, canvas_state=?, updated_at=? WHERE id=?",
            (data.name, data.switch_a_name, data.switch_b_name, json.dumps(data.canvas_state), now, topology_id),
        )

    for host in data.hosts:
        conn.execute(
            "INSERT INTO host (id, topology_id, name, position_x, position_y) VALUES (?, ?, ?, ?, ?)",
            (host.id, topology_id, host.name, host.position_x, host.position_y),
        )

    for cg in data.connection_groups:
        cg_id = str(uuid.uuid4())
        conn.execute(
            "INSERT INTO connection_group (id, topology_id, host_id, description, trunk_vlans, channel_group, vpc_id, switch_a_interfaces, switch_b_interfaces) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (cg_id, topology_id, cg.host_id, cg.description, cg.trunk_vlans, cg.channel_group, cg.vpc_id, json.dumps(cg.switch_a_interfaces), json.dumps(cg.switch_b_interfaces)),
        )

    conn.commit()
    conn.close()
    return get_topology(topology_id)


def delete_topology(topology_id: str) -> bool:
    conn = get_connection()
    cursor = conn.execute("DELETE FROM topology WHERE id = ?", (topology_id,))
    conn.commit()
    conn.close()
    return cursor.rowcount > 0


def clone_topology(topology_id: str, new_name: str) -> TopologyRead | None:
    original = get_topology(topology_id)
    if not original:
        return None

    connection_groups = []
    host_id_map = {}
    new_hosts = []

    for host in original.hosts:
        new_host_id = str(uuid.uuid4())
        host_id_map[host.id] = new_host_id
        new_hosts.append(HostCreate(
            id=new_host_id,
            name=host.name,
            position_x=host.position_x,
            position_y=host.position_y,
        ))
        if host.connection_group:
            cg = host.connection_group
            connection_groups.append(ConnectionGroupCreate(
                host_id=new_host_id,
                description=cg.description,
                trunk_vlans=cg.trunk_vlans,
                channel_group=cg.channel_group,
                vpc_id=cg.vpc_id,
                switch_a_interfaces=cg.switch_a_interfaces,
                switch_b_interfaces=cg.switch_b_interfaces,
            ))

    data = TopologySave(
        name=new_name,
        switch_a_name=original.switch_a_name,
        switch_b_name=original.switch_b_name,
        canvas_state=original.canvas_state,
        hosts=new_hosts,
        connection_groups=connection_groups,
    )
    return save_topology(None, data)
