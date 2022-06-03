const charEmotes = [{
        chars: ['c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
        emote: function(v) {
            return `:regional_indicator_${v}:`;
        }
    },
    {
        chars: ['b'],
        emote: ':b:'
    },
    {
        chars: ['a'],
        emote: ':a:'
    },
    {
        chars: ['o'],
        emote: ':o2:'
    },
    {
        chars: [' '],
        emote: '\u2003'
    },
    {
        chars: ['1'],
        emote: ':one:'
    },
    {
        chars: ['2'],
        emote: ':two:'
    },
    {
        chars: ['3'],
        emote: ':three:'
    },
    {
        chars: ['4'],
        emote: ':four:'
    },
    {
        chars: ['5'],
        emote: ':five:'
    },
    {
        chars: ['6'],
        emote: ':six:'
    },
    {
        chars: ['7'],
        emote: ':seven:'
    },
    {
        chars: ['8'],
        emote: ':eight:'
    },
    {
        chars: ['9'],
        emote: ':nine:'
    },
    {
        chars: ['0'],
        emote: ':zero:'
    },
    {
        chars: ['#'],
        emote: ':hash:'
    },
    {
        chars: ['!'],
        emote: ':exclamation:'
    },
    {
        chars: ['?'],
        emote: ':question:'
    },
    {
        chars: ['ß', 'ẞ'],
        emote: function(v) {
            return [':regional_indicator_s:', ':regional_indicator_s:']
        }
    }
]

exports.getEmote = function(char: string): any[] {
    const eM = charEmotes.find(cE => cE.chars.includes(char));
    if (!eM) return [];
    let e;
    if (typeof eM.emote === 'function') {
        e = eM.emote(char);
    } else {
        e = eM.emote;
    }
    return Array.isArray(e) ? e : [e];

}

exports.translateMessage = function (msg: string): string {
    let newMsg = [];
    for (let i = 0; i < msg.length; i += 1) {
        newMsg = newMsg.concat(this.getEmote(msg[i]));
    }
    return newMsg.join(' ');
}
