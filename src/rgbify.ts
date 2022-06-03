const rgbEmotes = [
    { chars: ["A", "a"], emote: '<a:rgb_a:518519691472535593>'},
	{ chars: ["B", "b"], emote: "<a:rgb_b:518519691283529778>"},
	{ chars: ["C", "c"], emote: "<a:rgb_c:518519691665473546>"},
	{ chars: ["D", "d"], emote: "<a:rgb_d:518519691413553162>"},
	{ chars: ["E", "e"], emote: "<a:rgb_e:518519691950686214>"},
	{ chars: ["F", "f"], emote: "<a:rgb_f:518519691543838725>"},
	{ chars: ["G", "g"], emote: "<a:rgb_g:518519691405164576>"},
	{ chars: ["H", "h"], emote: "<a:rgb_h:518519691707154432>"},
	{ chars: ["I", "i"], emote: "<a:rgb_i:518519692026183710>"},
	{ chars: ["J", "j"], emote: "<a:rgb_j:518519691745034261>"},
	{ chars: ["K", "k"], emote: "<a:rgb_k:518519691937841162>"},
	{ chars: ["L", "l"], emote: "<a:rgb_l:518519691866800129>"},
	{ chars: ["M", "m"], emote: "<a:rgb_m:518519691954618368>"},
	{ chars: ["N", "n"], emote: "<a:rgb_n:518519692244287503>"},
	{ chars: ["O", "o"], emote: "<a:rgb_o:518519691828789313>"},
	{ chars: ["P", "p"], emote: "<a:rgb_p:518519691942035461>"},
	{ chars: ["Q", "q"], emote: "<a:rgb_q:518519692030246917>"},
	{ chars: ["R", "r"], emote: "<a:rgb_r:518519692114001931>"},
	{ chars: ["S", "s"], emote: "<a:rgb_s:518519691858149386>"},
	{ chars: ["T", "t"], emote: "<a:rgb_t:518519691799691265>"},
	{ chars: ["U", "u"], emote: "<a:rgb_u:518519691828789393>"},
	{ chars: ["V", "v"], emote: "<a:rgb_v:518519691929583636>"},
	{ chars: ["W", "w"], emote: "<a:rgb_w:518519692026183680>"},
	{ chars: ["X", "x"], emote: "<a:rgb_x:518519691619336204>"},
	{ chars: ["Y", "y"], emote: "<a:rgb_y:518519692302876682>"},
	{ chars: ["Z", "z"], emote: "<a:rgb_z:518519691640307717>"},
	{ chars: ["?"], emote: "<a:rgb_question:518519691967463444>"},
	{ chars: ["!"], emote: "<a:rgb_exc:518519691619336192>"},
    { chars: [" "], emote: "<a:rgb_space:518519691950424084>"},
    { chars: ["."], emote: "<a:rgb_period:518519693120765982>"},
    { chars: [","], emote: "<a:rgb_comma:518519691388649509>"},
    { chars: ["0"], emote: "<a:rgb_0:518519690511908866>"},
    { chars: ["1"], emote: "<a:rgb_1:518519690637869056>"},
    { chars: ["2"], emote: "<a:rgb_2:518519690587537424>"},
    { chars: ["3"], emote: "<a:rgb_3:518519690633543680>"},
    { chars: ["4"], emote: "<a:rgb_4:518519690675355670>"},
    { chars: ["5"], emote: "<a:rgb_5:518519691023613953>"},
    { chars: ["6"], emote: "<a:rgb_6:518519691443175479>"},
    { chars: ["7"], emote: "<a:rgb_7:518519691585519636>"},
    { chars: ["8"], emote: "<a:rgb_8:518519691497570304>"},
    { chars: ["9"], emote: "<a:rgb_9:518519691816468490>"}
]

exports.getEmote = function(char: string): any[] {
    const eM = rgbEmotes.find(cE => cE.chars.includes(char));
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
