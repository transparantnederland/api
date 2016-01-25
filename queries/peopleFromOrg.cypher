// from Org ID to people
// People related with org

MATCH (orgs) WHERE orgs.id = {id}
OPTIONAL MATCH (orgs) <-[:`=`]- (concepts:`=`)
WITH coalesce(concepts,orgs) AS orgs

MATCH (orgs) <- [r0:`=i`|`tnl:related`|`tnl:member` * 1..2 ]-
  (r:_Rel) <-[r1:`tnl:related`|`tnl:member` ]-
  (person:`tnl:Person`)

return
  person.id as id,
  r.type as type,
  person.validSince as since,
  person.validUntil as until

// http://localhost:3001/peopleFromOrg?id=nevenfuncties/NJ0UX0_-ShGe
