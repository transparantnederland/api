// from ID to relations to people
// People related to people through orgs they are related to

MATCH (person:_) WHERE person.id = {id}

// Find corresponding concept node:
OPTIONAL MATCH (person) <-[:`=`]- (conceptP:`=`)
WITH coalesce(conceptP, person) AS person

// find organizations
MATCH (person)-[`=` * 0 .. 1]-()-[:«relations» * 2]-(orgs)
WHERE labels(orgs)[1] IN [«organizations»]


OPTIONAL MATCH (orgs) <- [:`=`] - (conceptO:`=`)
WITH coalesce(conceptO, orgs) AS orgs



// and people related to these/
//MATCH (orgs) <-[r0:«relations»]-> (r:_Rel) -[r1:«relations»]- (people:`tnl:Person`)

MATCH (orgs) <-[r0:`=i`|«relations» * 1..2]- (r:_Rel) <-[r1:«relations»]- (people:`tnl:Person`)


return people, orgs, r.type


// http://localhost:3001/peopleFromOrgsFromPerson?id=dbpedia_sg/VJBnjUsUl// 
// http://localhost:3001/peopleFromOrgsFromPerson?id=urn:hgid:dbpedia_sg/E1CqqS5Ll