from fastapi import APIRouter, HTTPException

from ..models import TopologySave, TopologyRead, TopologySummary, CloneRequest
from .. import crud

router = APIRouter(prefix="/api/topologies", tags=["topologies"])


@router.get("", response_model=list[TopologySummary])
def list_topologies():
    return crud.list_topologies()


@router.get("/{topology_id}", response_model=TopologyRead)
def get_topology(topology_id: str):
    result = crud.get_topology(topology_id)
    if not result:
        raise HTTPException(status_code=404, detail="Topology not found")
    return result


@router.post("", response_model=TopologyRead)
def create_topology(data: TopologySave):
    return crud.save_topology(None, data)


@router.put("/{topology_id}", response_model=TopologyRead)
def update_topology(topology_id: str, data: TopologySave):
    result = crud.save_topology(topology_id, data)
    if not result:
        raise HTTPException(status_code=404, detail="Topology not found")
    return result


@router.delete("/{topology_id}", status_code=204)
def delete_topology(topology_id: str):
    if not crud.delete_topology(topology_id):
        raise HTTPException(status_code=404, detail="Topology not found")


@router.post("/{topology_id}/clone", response_model=TopologyRead)
def clone_topology(topology_id: str, req: CloneRequest):
    result = crud.clone_topology(topology_id, req.name)
    if not result:
        raise HTTPException(status_code=404, detail="Topology not found")
    return result
