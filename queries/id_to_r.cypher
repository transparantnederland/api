// from ID to relations to people

MATCH (w:_) WHERE w.id = {id}

// Find corresponding concept node:
OPTIONAL MATCH w <-[:`=`]- (concepts:`=`)
WITH coalesce(concepts, w) AS w

//MATCH (w)-[`=` * 0 .. 1]-()-[:`tnl:related` * 2]-(p:`tnl:Public`)
MATCH (w)-[`=` * 0 .. 1]-()-[:`tnl:related` * 2]-(p:_)


MATCH (p)-[`=` * 0 .. 1]-()-[:`tnl:related` * 2]-(people:`tnl:Person`)

return people

