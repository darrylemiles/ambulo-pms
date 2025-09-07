const aboutUsTable = `CREATE TABLE IF NOT EXISTS about_us (
	story_section_title VARCHAR(100) not NULL,
	story_content TEXT not null,
	mission TEXT not null,
	vision TEXT not null, 
	core_values TEXT not null,
	homepage_about_subtitle TEXT not null,
	homepage_about_content TEXT not null,
	about_img1 VARCHAR(255),
	about_img2 VARCHAR(255),
	about_img3 VARCHAR(255),
	about_img4 VARCHAR(255)	
);`;

export default aboutUsTable;
