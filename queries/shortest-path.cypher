MATCH (m { id: {idFrom} }),(n { id: {idTo} }), p = shortestPath((m)-[*]-(n))
WITH extract(n IN nodes(p)| n.id) AS ids, extract(n IN nodes(p)| n.type) AS types
RETURN ids, types;
