MATCH (orgs) WHERE orgs.id = {id}
OPTIONAL MATCH (orgs) <-[:`=`]- (concepts:`=`)
WITH coalesce(concepts, orgs) AS orgs

MATCH (orgs) - [:`=i`|«relations» * 1..2] - (r:_Rel) - [:«relations» * 1..2] -> (children)

return
  children.id as id,
  r.type as type;
