module.exports = {
    config: {
        cooldown: 2
    },
    run: async (button, args) => {
        button.member.roles.add(args[0]);
        await button.deferUpdate();
    },
};