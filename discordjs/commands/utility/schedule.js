const { SlashCommandBuilder } = require('discord.js');
const { getPlanning } = require('../../data-fetch')
module.exports = {
	data: new SlashCommandBuilder()
		.setName('schedule')
		.setDescription('Display schedule'),
	async execute(interaction) {

		let response='';
		
		const schedule_request= await getPlanning();
		if (schedule_request.code != 200){
			response="Error"
		} else {
			var schedule = schedule_request.log
			response='## Tirnatek Radio Schedule :\n> ';
			for (let i of schedule){
				const start_at = new Date(i.start_timestamp*1000)
				const hours = start_at.getHours().toString().padStart(2, '0');
				const mins = start_at.getMinutes().toString().padStart(2, '0');
				response+=`> \`${hours}h${mins} : ${i.title}\`\n`
			}
		}



		await interaction.reply(response);
	},
};
