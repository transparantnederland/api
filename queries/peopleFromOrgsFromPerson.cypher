// from ID to relations to people
// People related to people through orgs they are related to

MATCH (person:_) WHERE person.id = {id}

// Find corresponding concept node:
OPTIONAL MATCH (person) <-[:`=`]- (conceptP:`=`)
WITH coalesce(person, conceptP) AS person

// find organizations
MATCH (person)-[`=` * 0 .. 1]-()-[:«relations» * 2]-(orgs)
WHERE labels(orgs)[1] IN [«organizations»]


OPTIONAL MATCH (orgs) <- [:`=`] - (conceptO:`=`)
WITH coalesce(orgs, conceptO ) AS orgs



// and people related to these/
// MATCH (orgs)-[`=` * 0 .. 1]-()-[:«relations» * 2]-(people:`tnl:Person`)
MATCH (orgs) <-[r0:«relations»]-> (r:_Rel) -[r1:«relations»]- (people:`tnl:Person`)



return people, orgs, r.type


// http://localhost:3001/peopleFromOrgsFromPerson?id=overheidsorganisaties/113479


