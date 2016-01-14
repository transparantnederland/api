// vind alle related persons, behalve mezelf

// find all persons in a concept
MATCH (person:_) WHERE person.id = {id}
OPTIONAL MATCH person -- (concept:`=`) -- p2 where p2.validSince is NOT null AND p2.validUntil is NOT null
WITH collect(DISTINCT p2) AS peeps

// find organizations
UNWIND peeps AS person
MATCH person -[:«relations»]-()-[:«relations»]- orgs
   WHERE labels(orgs)[1] IN [«organizations»]

WITH DISTINCT peeps, person, orgs

MATCH (orgs) <-[:`=i`|«relations» * 1..2]-
   (r:_Rel) <-[:«relations»]-
   (p:`tnl:Person`)
   WHERE NOT p IN peeps
  AND person.validSinceTimestamp <= p.validUntilTimestamp
  AND person.validUntilTimestamp >= p.validSinceTimestamp

RETURN DISTINCT p as people, orgs, r.type
