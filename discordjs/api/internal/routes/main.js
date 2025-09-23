// main.js
const { Router } = require("express");

module.exports = function(client) {
    const router = Router();

    router.post("/send-verif-code", async (req, res) => {
        try {
            const { discord_id, verif_code } = req.body;
            
            const user = await client.users.fetch(discord_id);

            if (!user) {
                return res.status(404).json({ error: "Utilisateur introuvable" });
            }

            await user.send(`Votre code de vérification est : \`\`\`\n${verif_code}\n\`\`\` `);

            res.status(200).json({ success: true, message: "Code envoyé avec succès !" });
        } catch (err) {
            console.error("Erreur en envoyant le message :", err);
            res.status(500).json({ error: "Impossible d'envoyer le message" });
        }
    });

    return router;
};