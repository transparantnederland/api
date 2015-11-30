// from Org ID to people
// People related with org

MATCH (orgs:_) WHERE orgs.id = {id}
OPTIONAL MATCH (orgs) <-[:`=`]- (concepts:`=`)
WITH coalesce(concepts, orgs) AS orgs

MATCH (orgs) <-[`=` * 0 .. 1]- () <-[:«relations» * 2]- (people:`tnl:Person`)
return people

