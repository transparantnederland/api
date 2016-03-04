MATCH (n) WHERE n.id = {id}
OPTIONAL MATCH (n) <-[:`=`]- (concept:`=`) <-[:`=i`]- (ni)
WITH coalesce(ni, n) AS n, (CASE n.type WHEN 'tnl:Person' THEN ["tnl:Organization","tnl:Public","tnl:PoliticalParty","tnl:Commercial","tnl:NonProfit"] ELSE ["tnl:Person"] END) AS types

MATCH (n) -[:`=`|`tnl:related`|`tnl:member`|`tnl:boardmember`|`tnl:advisor`|`tnl:commissioner`|`tnl:employee`|`tnl:lobbyist`|`tnl:spokesperson` *1..2]- (r:_Rel) -[:`tnl:related`|`tnl:member`|`tnl:boardmember`|`tnl:advisor`|`tnl:commissioner`|`tnl:employee`|`tnl:lobbyist`|`tnl:spokesperson`]- (m)
WHERE m.type IN types

WITH
  m.id AS id,
  r.type as type,
  n.id AS to,
  coalesce((CASE n.type WHEN "tnl:Person" THEN n.validSince ELSE m.validSince END), [''])[0] AS since,
	coalesce((CASE n.type WHEN "tnl:Person" THEN n.validUntil ELSE m.validUntil END), [''])[0] AS until

RETURN id, type, to, since, until
ORDER BY until DESC;
