// Find People who have had anything to do with an <organization>:


MATCH (w:`tnl:Organization`) WHERE w.name = '<organization>'

// Find corresponding concept node:
OPTIONAL MATCH w <-[:`=`]- (wConcept:`=`)
WITH coalesce(wConcept, w) AS w

// Find related persons (starting from concept node, or direct):
MATCH (w)-[`=` * 0 .. 1]-()-[:`tnl:related` * 2]-(p:`tnl:Person`)

// Find all persons in concept:
OPTIONAL MATCH (p)-[:`=i`]->(pConcept:`=`)-[:`=`]->(pp)
RETURN p, pp, pConcept
