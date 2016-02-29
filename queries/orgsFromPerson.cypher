// Orgs person is related to

MATCH (person:`tnl:Person`) WHERE person.id = {id}
// Find corresponding concept node:
//OPTIONAL MATCH (person) <-[:`=`]- (concepts:`=`)
//WITH coalesce(concepts, person) AS person

OPTIONAL MATCH (person) <-[:`=`]- (concepts:`=`) <-[:`=i`]- (peeps)
WITH coalesce(peeps, person) AS person

// find related organizations
MATCH (person) - [r0:`=`|«relations» * 1 .. 2]-> (r:_Rel) -[r1:«relations»]-> (orgs)
WHERE labels(orgs)[1] IN [«organizations»]
RETURN orgs, r.type, person.id as to, person.validSince as since, person.validUntil as until
