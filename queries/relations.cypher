MATCH (n) WHERE n.id = {id}
OPTIONAL MATCH (n) <-[:`=`]- (concept:`=`) <-[:`=i`]- (ni)
WITH coalesce(ni, n) AS n

MATCH (n) -[:`=`|`tnl:related`|`tnl:member`|`tnl:boardmember`|`tnl:advisor`|`tnl:commissioner`|`tnl:employee`|`tnl:lobbyist`|`tnl:spokesperson` *1..2]- (r:_Rel) -[:`tnl:related`|`tnl:member`|`tnl:boardmember`|`tnl:advisor`|`tnl:commissioner`|`tnl:employee`|`tnl:lobbyist`|`tnl:spokesperson`]- (m)
WHERE m.type IN ["tnl:Organization","tnl:Public","tnl:PoliticalParty","tnl:Commercial","tnl:NonProfit","tnl:Sector","tnl:Person"]

WITH
  m.id AS id,
  r.type as type,
  n.id AS to,
  coalesce((CASE n.type WHEN "tnl:Person" THEN n.validSince ELSE m.validSince END), [''])[0] AS since,
	coalesce((CASE n.type WHEN "tnl:Person" THEN n.validUntil ELSE m.validUntil END), [''])[0] AS until

RETURN id, type, to, since, until
ORDER BY until DESC;
