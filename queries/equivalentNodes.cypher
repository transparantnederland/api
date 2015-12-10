// find target nodes
MATCH (ids:_) WHERE ids.id = {id}
// find corresponding equivalence classes (ECs)
OPTIONAL MATCH (ids) <-[:`=`]- (concepts:`=`)
// choose the right node (EC if there, otherwise only member)
WITH ids, coalesce(concepts, ids) AS matched
// find paths
MATCH (found:_) - [:`=`|`=i` * 3 .. 9] -> (matched)
WHERE NOT found:_Rel AND NOT found:`=`
RETURN DISTINCT found


