from fastapi import APIRouter, HTTPException

from ..models import GeneratedConfig, TopologySave, ValidationError as VError
from .. import crud
from ..services.config_generator import generate_switch_config
from ..services.validator import validate_topology

router = APIRouter(prefix="/api", tags=["generate"])


@router.post("/topologies/{topology_id}/generate", response_model=GeneratedConfig)
def generate_config(topology_id: str):
    topology = crud.get_topology(topology_id)
    if not topology:
        raise HTTPException(status_code=404, detail="Topology not found")

    connection_groups = [h.connection_group for h in topology.hosts if h.connection_group]
    hosts_by_id = {h.id: h.name for h in topology.hosts}

    validation_errors = validate_topology(connection_groups, hosts_by_id)

    switch_a_config = generate_switch_config("A", connection_groups, topology.switch_a_name)
    switch_b_config = generate_switch_config("B", connection_groups, topology.switch_b_name)

    return GeneratedConfig(
        switch_a_name=topology.switch_a_name,
        switch_a_config=switch_a_config,
        switch_b_name=topology.switch_b_name,
        switch_b_config=switch_b_config,
        validation_errors=validation_errors,
    )


@router.post("/validate", response_model=list[VError])
def validate(data: TopologySave):
    from ..services.config_generator import derive_id_from_interfaces
    from ..models import ConnectionGroupRead

    hosts_by_id = {h.id: h.name for h in data.hosts}

    cg_reads = []
    for cg in data.connection_groups:
        all_interfaces = cg.switch_a_interfaces + cg.switch_b_interfaces
        derived = derive_id_from_interfaces(all_interfaces)
        cg_reads.append(ConnectionGroupRead(
            id="",
            topology_id="",
            host_id=cg.host_id,
            description=cg.description,
            trunk_vlans=cg.trunk_vlans,
            channel_group=cg.channel_group,
            vpc_id=cg.vpc_id,
            switch_a_interfaces=cg.switch_a_interfaces,
            switch_b_interfaces=cg.switch_b_interfaces,
            effective_channel_group=cg.channel_group if cg.channel_group is not None else derived,
            effective_vpc_id=cg.vpc_id if cg.vpc_id is not None else derived,
        ))

    return validate_topology(cg_reads, hosts_by_id)
