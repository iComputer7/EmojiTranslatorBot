const unownEmotes = [
    { chars: ["A", "a"], emote: '<:UnownA:466817129258418196>'},
	{ chars: ["B", "b"], emote: "<:UnownB:466817128188608518>"},
	{ chars: ["C", "c"], emote: "<:UnownC:466817129241640961>"},
	{ chars: ["D", "d"], emote: "<:UnownD:466817128457175053>"},
	{ chars: ["E", "e"], emote: "<:UnownE:466817129367470080>"},
	{ chars: ["F", "f"], emote: "<:UnownF:466817129380053002>"},
	{ chars: ["G", "g"], emote: "<:UnownG:466817128075362307>"},
	{ chars: ["H", "h"], emote: "<:UnownH:466817129426190336>"},
	{ chars: ["I", "i"], emote: "<:UnownI:466817128591392780>"},
	{ chars: ["J", "j"], emote: "<:UnownJ:466817128390066198>"},
	{ chars: ["K", "k"], emote: "<:UnownK:466817129065480195>"},
	{ chars: ["L", "l"], emote: "<:UnownL:466817128570290186>"},
	{ chars: ["M", "m"], emote: "<:UnownM:466817128398323723>"},
	{ chars: ["N", "n"], emote: "<:UnownN:466817128448655361>"},
	{ chars: ["O", "o"], emote: "<:UnownO:466817128503181312>"},
	{ chars: ["P", "p"], emote: "<:UnownP:466817129245835266>"},
	{ chars: ["Q", "q"], emote: "<:UnownQ:466817129430384650>"},
	{ chars: ["R", "r"], emote: "<:UnownR:466817129405218817>"},
	{ chars: ["S", "s"], emote: "<:UnownS:466817128742387715>"},
	{ chars: ["T", "t"], emote: "<:UnownT:466817129321332749>"},
	{ chars: ["U", "u"], emote: "<:UnownU:466817129484910642>"},
	{ chars: ["V", "v"], emote: "<:UnownV:466817128658370560>"},
	{ chars: ["W", "w"], emote: "<:UnownW:466817128457175043>"},
	{ chars: ["X", "x"], emote: "<:UnownX:466817128587067392>"},
	{ chars: ["Y", "y"], emote: "<:UnownY:466817128578809867>"},
	{ chars: ["Z", "z"], emote: "<:UnownZ:466817128687730698>"},
	{ chars: ["?"], emote: "<:UnownQue:466817128553644052>"},
	{ chars: ["!"], emote: "<:UnownExc:466817128293466114>"},
	{ chars: [" "], emote: "\u2003"}
]

exports.getEmote = function(char: string): any[] {
    const eM = unownEmotes.find(cE => cE.chars.includes(char));
    if (!eM) return [];
    let e = eM.emote;
    return Array.isArray(e) ? e : [e];
}

exports.translateMessage = function (msg: string): string {
    let newMsg = [];
    for (let i = 0; i < msg.length; i += 1) {
        newMsg = newMsg.concat(this.getEmote(msg[i]));
    }
    return newMsg.join(' ');
}
