LOAD CSV WITH HEADERS FROM 'https://cdn.neo4jlabs.com/data/grandstack_businesses.csv' AS line

MERGE (u:User { id: line.userId, name: line.userName })
MERGE (b:Business { businessId: line.businessId })
    ON CREATE SET 
    b.businessId = line.businessId,
    b.name = line.businessName,
    b.address = line.businessAddress,
    b.city = line.businessCity,
    b.state = line.businessState,
    b.location = point({ latitude: toFloat(line.latitude), longitude: toFloat(line.longitude) })

MERGE (r:Review { reviewId: line.reviewId })
  ON CREATE SET 
    r.text = line.reviewText,
    r.date = date(line.reviewDate),
    r.stars = line.reviewStars
    
MERGE (u)-[:REVIEW]->(r)
MERGE (r)-[:REVIEW]->(b)

WITH split(line.categories, ',') as categories, b
UNWIND categories as category 
MERGE (c:Category { name: category })
MERGE (b)-[:IN_CATEGORY]->(c);
