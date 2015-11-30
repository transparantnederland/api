// Orgs person is related to

MATCH (person:`tnl:Person`) WHERE person.id = {id}
// Find corresponding concept node:
OPTIONAL MATCH (person) <-[:`=`]- (concepts:`=`)
WITH coalesce(concepts, person) AS person

// find related organizations
MATCH (person)-[`=` * 0 .. 1]-()-[:«relations» * 2]-(orgs:`tnl:Organization`)
return orgs



// http://localhost:3001/orgsFromPerson?id=nevenfuncties/NyXL7RdbH2ze

