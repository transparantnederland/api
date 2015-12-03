// Orgs person is related to

MATCH (person:`tnl:Person`) WHERE person.id = {id}
// Find corresponding concept node:
OPTIONAL MATCH (person) <-[:`=`]- (concepts:`=`)
WITH coalesce(concepts, person) AS person

// find related organizations
MATCH (person) -[r0:«relations»]-> (r:_Rel) -[r1:«relations»]-> (orgs)
WHERE labels(orgs)[1] IN ["tnl:Organization","tnl:Public","tnl:PoliticalParty","tnl:Commercial","tnl:NonProfit"]
RETURN orgs,r.type



// http://localhost:3001/orgsFromPerson?id=nevenfuncties/NyXL7RdbH2ze


