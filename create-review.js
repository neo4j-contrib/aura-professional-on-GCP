const neo4j = require('neo4j-driver')
const reader = require("readline-sync");

const uri = 'neo4j+s://257b8125.databases.neo4j.io';
const user = 'neo4j';
const password = 'wqUoTs7uvOmo-qEkZTqDTrHQaM7DSRH2KoqQcbiY_kw';

const getBusinesses = async (session) => {
    const result = await session.readTransaction(tx => 
        tx.run('MATCH (b:Business) RETURN b.name AS name'));
    
    const businessNames = result.records.map(record => record.get('name'));
    session.close();
    return businessNames;
};

const saveRating = async (session, business, rating) => {
    const query = `
        MATCH (b:Business { name: $business })
        MERGE (u:User { id: 'system', name: 'system' })
        MERGE (r:Review { 
            id: apoc.create.uuid(),
            date: date(),
            stars: $rating
        })
        CREATE (u)-[:REVIEW]->(r)
        CREATE (r)-[:REVIEW]->(b)
    `

    const result = await session.writeTransaction(tx => 
        tx.run(query, { business, rating }));
    return result;
}

const main = async () => {
    const driver = neo4j.driver(uri, neo4j.auth.basic(user, password))
        
    const businesses = await getBusinesses(driver.session());
    let businessOptions = '';
    for (let i=0; i<businesses.length; i++) {
        businessOptions = businessOptions + i + ': ' + businesses[i] + '\n';
    }

    const option = reader.question(`Please select a business to review, by entering a number:\n${businessOptions}\n> `);
    const rating = reader.question(`Please enter your rating, 1-5 stars: `);

    console.log('You rated ', businesses[option], 'with', rating, 'stars!');

    console.log('Saving to Neo4j Aura...');
    await saveRating(driver.session(), businesses[option], rating);
    driver.close();
    console.log('All done!');
};

main();
