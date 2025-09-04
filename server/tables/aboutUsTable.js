const aboutUsTable = `CREATE TABLE IF NOT EXISTS about_us (
	story_section_title VARCHAR(100) not NULL,
	story_content TEXT not null,
	mission TEXT not null,
	vision TEXT not null, 
	core_values TEXT not null	
);`;

export default aboutUsTable;