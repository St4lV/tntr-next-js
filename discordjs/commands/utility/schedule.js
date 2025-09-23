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
			for (const i of schedule) {
				const [hours, mins] = i.start.toString().split("T")[1].split(":");
				response += `> \`${hours}h${mins} : ${i.title}\`\n`;
			}
		}



		await interaction.reply(response);
	},
};
