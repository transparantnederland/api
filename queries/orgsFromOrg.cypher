MATCH (orgs) WHERE orgs.id = {id}
OPTIONAL MATCH (orgs) <-[:`=`]- (concepts:`=`)
WITH coalesce(concepts, orgs) AS orgs

MATCH (orgs) -[:`=i`|«relations» * 1..8]- (:_Rel) -[:«relations»]- (network)
MATCH (network) <-[:`=i`|«relations» * 1..2]- (r:_Rel) -[:«relations»]- (parents)

RETURN network.id AS id, r.type AS type, parents.id AS to;
