import { locateUserCommand } from "../types";
import { commandTypeHelpers as ct } from "../../../commandTypes";
import moment from "moment-timezone";
import humanizeDuration from "humanize-duration";
import { MINUTES, SECONDS } from "src/utils";
import { sendErrorMessage, sendSuccessMessage } from "src/pluginUtils";

export const FollowCmd = locateUserCommand({
  trigger: ["follow", "f"],
  description: "Sets up an alert that notifies you any time `<member>` switches or joins voice channels",
  usage: "!f 108552944961454080",
  permission: "can_alert",

  signature: {
    member: ct.resolvedMember(),
    reminder: ct.string({ required: false, catchAll: true }),

    duration: ct.delay({ option: true, shortcut: "d" }),
    active: ct.bool({ option: true, shortcut: "a" }),
  },

  async run({ message: msg, args, pluginData }) {
    const time = args.duration || 10 * MINUTES;
    const alertTime = moment().add(time, "millisecond");
    const body = args.reminder || "None";
    const active = args.active || false;

    if (time < 30 * SECONDS) {
      sendErrorMessage(pluginData, msg.channel, "Sorry, but the minimum duration for an alert is 30 seconds!");
      return;
    }

    await pluginData.state.alerts.add(
      msg.author.id,
      args.member.id,
      msg.channel.id,
      alertTime.format("YYYY-MM-DD HH:mm:ss"),
      body,
      active,
    );
    if (!pluginData.state.usersWithAlerts.includes(args.member.id)) {
      pluginData.state.usersWithAlerts.push(args.member.id);
    }

    if (active) {
      sendSuccessMessage(
        pluginData,
        msg.channel,
        `Every time ${args.member.mention} joins or switches VC in the next ${humanizeDuration(
          time,
        )} i will notify and move you.\nPlease make sure to be in a voice channel, otherwise i cannot move you!`,
      );
    } else {
      sendSuccessMessage(
        pluginData,
        msg.channel,
        `Every time ${args.member.mention} joins or switches VC in the next ${humanizeDuration(
          time,
        )} i will notify you`,
      );
    }
  },
});
