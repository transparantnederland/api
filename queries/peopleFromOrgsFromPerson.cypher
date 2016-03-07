// vind alle related persons, behalve mezelf

// find all persons in a concept
MATCH (person:_) WHERE person.id = {id}
OPTIONAL MATCH person -- (concept:`=`) -- p2
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

RETURN DISTINCT
  p.id AS id,
  r.type AS type,
  orgs.id AS to,
  orgs.name AS to_name,
  coalesce(p.validSince, [''])[0] AS since,
  coalesce(p.validUntil, [''])[0] AS until
ORDER BY until DESC;
