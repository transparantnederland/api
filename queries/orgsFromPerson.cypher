// Find organizations related to a person

MATCH (person:`tnl:Person`) WHERE person.id = {id}
OPTIONAL MATCH (person) <-[:`=`]- (concepts:`=`) <-[:`=i`]- (peeps)
WITH coalesce(peeps, person) AS person

MATCH (person) -[r0:`=`|«relations» *1..2]-> (r:_Rel) -[r1:«relations»]-> (orgs)
WHERE labels(orgs)[1] IN [«organizations»]
RETURN
  orgs.id AS id,
  r.type AS type,
  person.id AS to,
  coalesce(person.validSince, [''])[0] AS since,
  coalesce(person.validUntil, [''])[0] AS until
ORDER BY until DESC;
