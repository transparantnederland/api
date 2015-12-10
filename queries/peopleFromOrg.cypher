// from Org ID to people
// People related with org

MATCH (orgs) WHERE orgs.id = {id}
OPTIONAL MATCH (orgs) <-[:`=`]- (concepts:`=`)
WITH coalesce(concepts,orgs) AS orgs

MATCH (orgs) <-[r0:`=`|«relations»]-> (r:_Rel) -[r1:«relations»]- (people:`tnl:Person`)

return people,r.type

// http://localhost:3001/peopleFromOrg?id=nevenfuncties/NJ0UX0_-ShGe

