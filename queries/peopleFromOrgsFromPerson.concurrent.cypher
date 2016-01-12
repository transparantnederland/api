// vind alle related persons, behalve mezelf

// find all persons in a concept
MATCH (person:_) WHERE person.id = {id}
OPTIONAL MATCH person -- (concept:`=`) -- p2
WITH collect(DISTINCT p2) AS peeps

// find organizations
UNWIND peeps AS person
MATCH person -[:«relations»]-()-[:«relations»]- orgs
// MATCH person -[:«relations» * 2]- orgs
   WHERE labels(orgs)[1] IN [«organizations»]

WITH DISTINCT peeps, person, orgs

MATCH orgs <-[:«relations»]-
   (r:_Rel) <-[:«relations»]-
   (p:`tnl:Person`)
   WHERE NOT p IN peeps
//   AND p.validSince >= person.validSince
//   AND p.validUntil <= person.validUntil

RETURN DISTINCT p as people, orgs,  r.type





//WITH collect(p) AS ps
//UNWIND ps AS p1
//UNWIND ps AS p2
//MATCH p1, p2
//WHERE
//  (coalesce(p1.validSinceTimestamp, -99999999999) <= coalesce(p2.validUntilTimestamp, timestamp() / 1000)) AND
//  (coalesce(p1.validUntilTimestamp, timestamp() / 1000) >= coalesce(p2.validSinceTimestamp, -99999999999)) AND
//  (p1.id <> p2.id)
//RETURN DISTINCT p1.id, p2.id
