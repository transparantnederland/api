// Find people related to organization

MATCH (orgs) WHERE orgs.id = {id}
OPTIONAL MATCH (orgs) <-[:`=`]- (concepts:`=`)
WITH coalesce(concepts,orgs) AS orgs

MATCH (orgs) <-[r0:`=i`|«relations» * 1..2 ]- (r:_Rel) <-[r1:«relations» ]- (person:`tnl:Person`)

RETURN
  person.id AS id,
  r.type AS type,
  orgs.id AS to,
  coalesce(person.validSince, [''])[0] AS since,
  coalesce(person.validUntil, [''])[0] AS until
ORDER BY until DESC;
