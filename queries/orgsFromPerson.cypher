// Orgs person is related to

MATCH (person:`tnl:Person`) WHERE person.id = {id}
// Find corresponding concept node:
OPTIONAL MATCH (person) <-[:`=`]- (concepts:`=`)
WITH coalesce(concepts, person) AS person

// find related organizations
MATCH (person) - [r0:`=`|«relations» * 1 .. 2]-> (r:_Rel) -[r1:«relations»]-> (orgs)
WHERE labels(orgs)[1] IN [«organizations»]
RETURN orgs,r.type



// http://localhost:3001/orgsFromPerson?id=nevenfuncties/NyXL7RdbH2ze
