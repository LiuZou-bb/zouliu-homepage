/* Approved fictional dialogue. Page-local progress; ending and quiet waits are explicit. */
(function (global) {
    "use strict";
    var nodes = {
    "1": {
        "text": "dream_node_1",
        "options": [
            {
                "label": "dream_option_1_0",
                "next": 2
            },
            {
                "label": "dream_option_1_1",
                "next": null
            }
        ]
    },
    "2": {
        "text": "dream_node_2",
        "options": [
            {
                "label": "dream_option_2_0",
                "next": 3
            },
            {
                "label": "dream_option_2_1",
                "next": null
            }
        ]
    },
    "3": {
        "text": "dream_node_3",
        "options": [
            {
                "label": "dream_option_3_0",
                "next": 4
            },
            {
                "label": "dream_option_3_1",
                "next": null
            }
        ]
    },
    "4": {
        "text": "dream_node_4",
        "options": [
            {
                "label": "dream_option_4_0",
                "next": 5
            },
            {
                "label": "dream_option_4_1",
                "next": null
            }
        ]
    },
    "5": {
        "text": "dream_node_5",
        "options": [
            {
                "label": "dream_option_5_0",
                "next": 6
            },
            {
                "label": "dream_option_5_1",
                "next": null
            }
        ]
    },
    "6": {
        "text": "dream_node_6",
        "options": [
            {
                "label": "dream_option_6_0",
                "next": 7
            },
            {
                "label": "dream_option_6_1",
                "next": null
            }
        ],
        "caption": "dream_fragment_title"
    },
    "7": {
        "text": "dream_node_7",
        "options": [
            {
                "label": "dream_option_7_0",
                "next": 8
            },
            {
                "label": "dream_option_7_1",
                "next": null
            }
        ]
    },
    "8": {
        "text": "dream_node_8",
        "options": [
            {
                "label": "dream_option_8_0",
                "next": 9
            },
            {
                "label": "dream_option_8_1",
                "next": null
            }
        ]
    },
    "9": {
        "text": "dream_node_9",
        "options": [
            {
                "label": "dream_option_9_0",
                "next": 10
            }
        ]
    },
    "10": {
        "text": "dream_node_10",
        "options": [
            {
                "label": "dream_option_10_0",
                "next": 11
            }
        ]
    },
    "11": {
        "text": "dream_node_11",
        "options": [
            {
                "label": "dream_option_11_0",
                "next": 12
            }
        ]
    },
    "12": {
        "text": "dream_node_12",
        "options": [
            {
                "label": "dream_option_12_0",
                "next": 13
            }
        ]
    },
    "13": {
        "text": "dream_node_13",
        "options": [
            {
                "label": "dream_option_13_0",
                "next": 14
            }
        ]
    },
    "14": {
        "text": "dream_node_14",
        "options": [
            {
                "label": "dream_option_14_0",
                "next": 15
            },
            {
                "label": "dream_option_14_1",
                "next": 16
            }
        ]
    },
    "15": {
        "text": "dream_node_15",
        "options": [
            {
                "label": "dream_option_15_0",
                "next": 17
            },
            {
                "label": "dream_option_15_1",
                "next": 18
            }
        ]
    },
    "16": {
        "text": "dream_node_16",
        "options": [
            {
                "label": "dream_option_16_0",
                "next": 18
            },
            {
                "label": "dream_option_16_1",
                "next": 19
            }
        ]
    },
    "17": {
        "text": "dream_node_17",
        "options": [
            {
                "label": "dream_option_17_0",
                "next": 20
            },
            {
                "label": "dream_option_17_1",
                "next": 21
            }
        ]
    },
    "18": {
        "text": "dream_node_18",
        "options": [
            {
                "label": "dream_option_18_0",
                "next": 22
            },
            {
                "label": "dream_option_18_1",
                "next": 22
            }
        ]
    },
    "19": {
        "text": "dream_node_19",
        "options": [
            {
                "label": "dream_option_19_0",
                "next": 23
            },
            {
                "label": "dream_option_19_1",
                "next": 23
            }
        ]
    },
    "20": {
        "text": "dream_node_20",
        "options": [
            {
                "label": "dream_option_20_0",
                "next": 24
            },
            {
                "label": "dream_option_20_1",
                "next": 18
            }
        ]
    },
    "21": {
        "text": "dream_node_21",
        "options": [
            {
                "label": "dream_option_21_0",
                "next": 20
            },
            {
                "label": "dream_option_21_1",
                "next": 24
            }
        ]
    },
    "22": {
        "text": "dream_node_22",
        "options": [
            {
                "label": "dream_option_22_0",
                "next": 24
            },
            {
                "label": "dream_option_22_1",
                "next": 24
            }
        ]
    },
    "23": {
        "text": "dream_node_23",
        "options": [
            {
                "label": "dream_option_23_0",
                "next": 24
            },
            {
                "label": "dream_option_23_1",
                "next": 24
            }
        ]
    },
    "24": {
        "text": "dream_node_24",
        "options": [
            {
                "label": "dream_option_24_0",
                "next": 25
            },
            {
                "label": "dream_option_24_1",
                "next": 26
            }
        ],
        "addedRound": 1,
        "branch": ""
    },
    "25": {
        "text": "dream_node_25",
        "options": [
            {
                "label": "dream_option_25_0",
                "next": 27
            },
            {
                "label": "dream_option_25_1",
                "next": 27
            }
        ],
        "addedRound": 2,
        "branch": "问名字"
    },
    "26": {
        "text": "dream_node_26",
        "options": [
            {
                "label": "dream_option_26_0",
                "next": 27
            },
            {
                "label": "dream_option_26_1",
                "next": 27
            }
        ],
        "addedRound": 2,
        "branch": "怀疑看错"
    },
    "27": {
        "text": "dream_node_27",
        "options": [
            {
                "label": "dream_option_27_0",
                "next": 28
            },
            {
                "label": "dream_option_27_1",
                "next": 29
            }
        ],
        "addedRound": 3,
        "branch": ""
    },
    "28": {
        "text": "dream_node_28",
        "options": [
            {
                "label": "dream_option_28_0",
                "next": 30
            },
            {
                "label": "dream_option_28_1",
                "next": 30
            }
        ],
        "addedRound": 4,
        "branch": "会记得"
    },
    "29": {
        "text": "dream_node_29",
        "options": [
            {
                "label": "dream_option_29_0",
                "next": 30
            },
            {
                "label": "dream_option_29_1",
                "next": 30
            }
        ],
        "addedRound": 4,
        "branch": "醒了就忘"
    },
    "30": {
        "text": "dream_node_30",
        "options": [
            {
                "label": "dream_option_30_0",
                "next": 31
            },
            {
                "label": "dream_option_30_1",
                "next": 31
            }
        ],
        "addedRound": 5,
        "branch": ""
    },
    "31": {
        "text": "dream_node_31",
        "options": [
            {
                "label": "dream_option_31_0",
                "next": 32
            },
            {
                "label": "dream_option_31_1",
                "next": 34
            }
        ],
        "endingStage": true
    },
    "32": {
        "text": "dream_node_32",
        "options": [
            {
                "label": "dream_option_32_0",
                "next": 33
            },
            {
                "label": "dream_option_32_1",
                "next": 33
            }
        ]
    },
    "33": {
        "text": "dream_node_33",
        "options": [
            {
                "label": "dream_option_33_0",
                "next": 33,
                "wait": true
            },
            {
                "label": "dream_option_33_1",
                "next": 34
            }
        ],
        "quietStay": true
    },
    "34": {
        "text": "dream_node_34",
        "options": [
            {
                "label": "dream_option_34_0",
                "next": 35
            },
            {
                "label": "dream_option_34_1",
                "next": 35
            }
        ]
    },
    "35": {
        "text": "dream_node_35",
        "options": [
            {
                "label": "dream_option_35_0",
                "next": "bubble"
            },
            {
                "label": "dream_option_35_1",
                "next": null
            }
        ],
        "final": true
    }
};
    var bubbles = ["dream_bubble_0","dream_bubble_1","dream_bubble_2","dream_bubble_3","dream_bubble_4","dream_bubble_5","dream_bubble_6","dream_bubble_7","dream_bubble_8","dream_bubble_9","dream_bubble_10","dream_bubble_11","dream_bubble_12","dream_bubble_13","dream_bubble_14","dream_bubble_15","dream_bubble_16","dream_bubble_17","dream_bubble_18","dream_bubble_19","dream_bubble_20","dream_bubble_21","dream_bubble_22","dream_bubble_23","dream_bubble_24","dream_bubble_25","dream_bubble_26","dream_bubble_27","dream_bubble_28","dream_bubble_29","......","......","......","......","......","......","......","......","......","......","","","","","","","","","",""];
    var zh = {
    "dream_archive": "梦境私藏",
    "dream_bubble_0": "没有了",
    "dream_bubble_1": "真没有了",
    "dream_bubble_10": "真没藏别的",
    "dream_bubble_11": "不信你再找",
    "dream_bubble_12": "你看还是没有",
    "dream_bubble_13": "想过了没别的",
    "dream_bubble_14": "我也没辙了",
    "dream_bubble_15": "别等下一句",
    "dream_bubble_16": "下一句也没有",
    "dream_bubble_17": "真不是吊胃口",
    "dream_bubble_18": "不是故意不说",
    "dream_bubble_19": "是实在没得说",
    "dream_bubble_2": "这回真没了",
    "dream_bubble_20": "空的就是空的",
    "dream_bubble_21": "再点也是空的",
    "dream_bubble_22": "这句不算新的",
    "dream_bubble_23": "连这句都多余",
    "dream_bubble_24": "没了就是没了",
    "dream_bubble_25": "别等啦真没了",
    "dream_bubble_26": "我也想不出了",
    "dream_bubble_27": "再说就重复了",
    "dream_bubble_28": "好吧最后一句",
    "dream_bubble_29": "真的没有了",
    "dream_bubble_3": "就到这儿了",
    "dream_bubble_4": "后面没了",
    "dream_bubble_5": "已经到底了",
    "dream_bubble_6": "再翻也没有",
    "dream_bubble_7": "一字不剩了",
    "dream_bubble_8": "一句都没了",
    "dream_bubble_9": "我都说完了",
    "dream_fragment_title": "梦境碎片 001",
    "dream_greeting": "你好，熟人。",
    "dream_node_1": "亲密度不足，暂时无法查看。\n多多交流，亲密度自然会上涨。",
    "dream_node_10": "我要有这本事，早给自己开个出口了。\n不信你搜。我身上就那张纸。",
    "dream_node_11": "我试过。\n有一次，我以为自己回去了。连窗外的声音都跟以前一样。\n后来一睁眼，还是这扇门。",
    "dream_node_12": "也许正在做梦的，是看着这些字的人。\n先别急着否认。上次做梦的时候，你也没一进去就发现吧。",
    "dream_node_13": "这得问你。\n不过，你没来之前，我也在这儿。\n那时候，谁在梦见我？",
    "dream_node_14": "先别急着醒。再陪我聊会儿。\n刚才说到哪儿了？",
    "dream_node_15": "我只留着这张纸。\n写的是「回来」。可我不记得自己离开过。",
    "dream_node_16": "有人让我替他看一会儿门。\n我答应得太快，没问他什么时候回来。\n现在想想，应该先谈工钱。",
    "dream_node_17": "像是我写的。\n尤其这个「回」字，写歪的地方都一样。\n可我不记得给谁留过这话。",
    "dream_node_18": "你一开口，我差点说「怎么才来」。\n可真要想，我们在哪儿见过，又一点也想不起来。",
    "dream_node_19": "以前没想过。\n可我试过走远一点。回头，门还在身后。\n我换了个方向走，还是一样。",
    "dream_node_2": "先聊着呗。又不是按两下就能涨的。\n不然我跟鼠标早就情同手足了。",
    "dream_node_20": "要真是我写的，怎么偏偏不记得了？\n我想过把纸扔掉。\n又怕真有人照着它回来，找不到我。",
    "dream_node_21": "那他得认识我很久了。\n连这个「回」字都学歪了。\n要不是你提醒，我还真以为是自己写的。",
    "dream_node_22": "想不起来。\n不过跟你说话，不太像头一回。\n要不，就从这回开始记吧。",
    "dream_node_23": "我敲过三下。\n里面也回了三下。\n我就没再敲。万一对面也在等我先开门呢？",
    "dream_node_24": "等一下。\n这张纸最下面……刚才有名字吗？\n我记得背面只有那几行字。",
    "dream_node_25": "像是我的名字。\n奇怪，平时随口就能说，怎么现在到了嘴边，又叫不出来了。",
    "dream_node_26": "但愿是我看错了。\n我把纸放下，再拿起来，那个名字却挪到了另一边。\n你要不要看看？",
    "dream_node_27": "不看了，先收着。\n我倒想问你：真醒过来以后，你还会记得这里吗？",
    "dream_node_28": "那你醒了以后，替我看看那家店还亮不亮。\n……算了。你连在哪条街都不知道。\n就记得有个人在这儿等过你吧。",
    "dream_node_29": "那就别勉强自己记。\n再来一回，我再说一遍。\n我在这儿待着，别的没有，时间倒多得很。",
    "dream_node_3": "看门的。\n不过你要是真想进去，别指望我带路。我连钥匙都没有。",
    "dream_node_30": "我又不赶时间。\n你要是哪天再梦到这扇门，先别敲。\n叫我一声。省得我又以为自己一个人。",
    "dream_node_31": "叫我「看门的」吧。\n\n……你还真把这些字都看下来了。\n我刚才还在猜你会在哪一句关掉。",
    "dream_node_32": "好啊。那这回换我问。\n要是真在做梦，你醒了会怎么讲这一段？",
    "dream_node_33": "那就好，别光记着门，把我给忘了。\n\n我一时也想不起别的了。\n你要是不急，就陪我坐会儿。",
    "dream_node_34": "嗯，下次见。\n\n下次来，直接打招呼就好。\n亲密度那句话，就不拿来拦你了。\n\n我认得你了。",
    "dream_node_35": "……你看，「退出」回来了。\n刚才只顾着跟你说话，都没发现。\n\n它倒是会挑时候。",
    "dream_node_4": "我没进去过。\n有一回，门缝里滑出一张纸。我还以为终于有人给我送钥匙了。",
    "dream_node_5": "「醒了记得回来。」\n就这六个字，没留名字。\n我翻过来，才发现背面还有字。",
    "dream_node_6": "这里曾经有一个世界。\n那里的人们拥有自己的故事。\n但造物主还未完成它。",
    "dream_node_7": "应该是吧。\n我记得一条街，记得路边有家一直亮着灯的店。\n可你要我说出店名，我又想不起来。",
    "dream_node_8": "嗯。你要是不急，就再待会儿。\n这里没茶，只能陪你说话。",
    "dream_node_9": "……刚才还能走的。\n看来，你和我一样被困在了这里。\n不是，你看我干什么？",
    "dream_option_10_0": "那怎么出去？",
    "dream_option_11_0": "你是在做梦吗？",
    "dream_option_12_0": "那你怎么会在我的梦里？",
    "dream_option_13_0": "那接下来呢？",
    "dream_option_14_0": "说到门里的事。",
    "dream_option_14_1": "你还没说，为什么在这儿。",
    "dream_option_15_0": "这字是谁写的？",
    "dream_option_15_1": "说不定我以前来过。",
    "dream_option_16_0": "你在等他？",
    "dream_option_16_1": "你确定自己是看门的？",
    "dream_option_17_0": "你在梦里写的？",
    "dream_option_17_1": "也可能是别人学的。",
    "dream_option_18_0": "你是不是认错人了？",
    "dream_option_18_1": "那你再仔细想想。",
    "dream_option_19_0": "你敲过门吗？",
    "dream_option_19_1": "你就不想进去看看？",
    "dream_option_1_0": "亲密度怎么涨？",
    "dream_option_1_1": "那我先走了。",
    "dream_option_20_0": "那就再留一会儿。",
    "dream_option_20_1": "你觉得那个人是我？",
    "dream_option_21_0": "也许就是你。",
    "dream_option_21_1": "先留着吧，别弄丢了。",
    "dream_option_22_0": "好，那就重新认识。",
    "dream_option_22_1": "这回别再忘了。",
    "dream_option_23_0": "那就先陪你等会儿。",
    "dream_option_23_1": "不敲了，歇会儿吧。",
    "dream_option_24_0": "写的是谁？",
    "dream_option_24_1": "你刚才没看清吧。",
    "dream_option_25_0": "我也经常这样。",
    "dream_option_25_1": "别念了，听着有点吓人。",
    "dream_option_26_0": "先放下，我不碰。",
    "dream_option_26_1": "别翻了，越翻越怪。",
    "dream_option_27_0": "会。我记着你呢。",
    "dream_option_27_1": "梦里的事，醒了就忘了。",
    "dream_option_28_0": "那你可得等着。",
    "dream_option_28_1": "你不怕我忘了？",
    "dream_option_29_0": "那我下次还问。",
    "dream_option_29_1": "你不嫌麻烦？",
    "dream_option_2_0": "那你是谁？",
    "dream_option_2_1": "我就是随便看看。",
    "dream_option_30_0": "好，下次先叫你。",
    "dream_option_30_1": "那你得先告诉我名字。",
    "dream_option_31_0": "那就再聊两句。",
    "dream_option_31_1": "那今天先到这儿，下次见。",
    "dream_option_32_0": "梦见一个话很多的看门人。",
    "dream_option_32_1": "梦见一个装作不认识我的人。",
    "dream_option_33_0": "嗯，坐会儿。",
    "dream_option_33_1": "那我先回去了。",
    "dream_option_34_0": "下次见，看门的。",
    "dream_option_34_1": "记住你这句话了。",
    "dream_option_35_0": "真的没有了？",
    "dream_option_35_1": "退出",
    "dream_option_3_0": "门后面是什么？",
    "dream_option_3_1": "那你接着看吧。",
    "dream_option_4_0": "纸上写了什么？",
    "dream_option_4_1": "你慢慢等，我先走了。",
    "dream_option_5_0": "背面写了什么？",
    "dream_option_5_1": "你慢慢看，我先走了。",
    "dream_option_6_0": "那你也是那个世界里的？",
    "dream_option_6_1": "那我先不打扰这个世界了。",
    "dream_option_7_0": "所以你一直没走？",
    "dream_option_7_1": "那就不打扰你了。",
    "dream_option_8_0": "那就再聊会儿。",
    "dream_option_8_1": "不了，我该走了。",
    "dream_option_9_0": "是不是你干的？",
    "dream_secret": "我可看着呢。\n五十次，后面都没字了，你还在点。\n\n……这么舍不得我，怎么不来找我聊聊？\n\n见面记得问一句：「奶茶呢？」\n我请。",
    "dream_secret_title": "恭喜你，发现了彩蛋。",
    "thought_dream_core": "梦把记忆、情绪与想象编织成另一种叙事。这里记录着18个让我情绪剧烈起伏且深刻的梦，含解析共计七千八百多字，祂引领我弥补不足走向完整。",
    "thought_dream_title": "梦的解析",
    "dream_departure": "你醒了。那我呢？",
    "dream_choices_aria": "你想说的话",
    "dream_close": "关闭窗口"
};
    var en = {
    "dream_archive": "PRIVATE DREAM ARCHIVE",
    "dream_bubble_0": "Nothing else.",
    "dream_bubble_1": "Really, nothing.",
    "dream_bubble_10": "I’m not hiding anything.",
    "dream_bubble_11": "Look if you don’t believe me.",
    "dream_bubble_12": "See? Still nothing.",
    "dream_bubble_13": "I checked. Nothing else.",
    "dream_bubble_14": "I’ve got nothing either.",
    "dream_bubble_15": "Don’t wait for another line.",
    "dream_bubble_16": "There isn’t another line.",
    "dream_bubble_17": "I’m not stringing you along.",
    "dream_bubble_18": "I’m not holding out on you.",
    "dream_bubble_19": "I really have nothing to say.",
    "dream_bubble_2": "This time, I mean it.",
    "dream_bubble_20": "Blank means blank.",
    "dream_bubble_21": "More clicks won’t fill it.",
    "dream_bubble_22": "This doesn’t count as new.",
    "dream_bubble_23": "Even this line is extra.",
    "dream_bubble_24": "Nothing means nothing.",
    "dream_bubble_25": "Don’t wait. Really, nothing.",
    "dream_bubble_26": "I can’t think of more.",
    "dream_bubble_27": "I’d just be repeating myself.",
    "dream_bubble_28": "All right. One last line.",
    "dream_bubble_29": "There really is nothing else.",
    "dream_bubble_3": "That’s all there is.",
    "dream_bubble_4": "Nothing after this.",
    "dream_bubble_5": "You’ve reached the end.",
    "dream_bubble_6": "Nothing on the next page.",
    "dream_bubble_7": "Not a word left.",
    "dream_bubble_8": "Not one more line.",
    "dream_bubble_9": "I’ve said everything.",
    "dream_fragment_title": "Dream Fragment 001",
    "dream_greeting": "Hello, familiar stranger.",
    "dream_node_1": "We’re not quite close enough for this yet.\nTalk a little more. These things grow naturally.",
    "dream_node_10": "If I could do that, I’d have made myself a way out by now.\nSearch me if you like. All I’ve got is that note.",
    "dream_node_11": "I’ve tried.\nOnce, I thought I was home. Even the sounds outside the window were just as I remembered.\nThen I opened my eyes, and there was the door again.",
    "dream_node_12": "Perhaps the one dreaming is the person reading these words.\nDon’t be so quick to rule it out. You didn’t know straight away the last time you were dreaming, did you?",
    "dream_node_13": "You’d have to tell me.\nBut I was here before you arrived.\nWho was dreaming of me then?",
    "dream_node_14": "Don’t wake up just yet. Stay and talk a little longer.\nWhere were we?",
    "dream_node_15": "All I have is this note.\nIt says “come back.” But I don’t remember leaving.",
    "dream_node_16": "Someone asked me to mind the door for a little while.\nI said yes before asking when they’d be back.\nShould’ve settled the pay first.",
    "dream_node_17": "It looks like my handwriting.\nEven that crooked character—the one meaning “return”—looks just like mine.\nBut I don’t remember leaving anyone this note.",
    "dream_node_18": "When you spoke, I nearly said, “What took you so long?”\nBut when I try to remember where we’ve met, there’s nothing.",
    "dream_node_19": "I hadn’t thought about it.\nI did try walking away once. When I turned round, the door was still behind me.\nI tried another direction. Same thing.",
    "dream_node_2": "We could start by talking. A couple of clicks won’t do it.\nOtherwise, my mouse and I would be inseparable by now.",
    "dream_node_20": "If I wrote it, why can’t I remember?\nI’ve thought about throwing it away.\nBut what if someone follows it back here and can’t find me?",
    "dream_node_21": "They must know me pretty well, then.\nThey even copied that crooked character.\nIf you hadn’t said anything, I’d have thought I’d written it myself.",
    "dream_node_22": "I can’t remember.\nBut talking to you doesn’t feel like the first time.\nMaybe we can start with this time.",
    "dream_node_23": "I knocked three times.\nThree knocks came back.\nI left it at that. What if they’re waiting for me to open it, too?",
    "dream_node_24": "Wait a moment.\nThat name at the bottom of the note… was it there before?\nI remember there being just those few lines on the back.",
    "dream_node_25": "It looks like mine.\nStrange. Usually I can say it without thinking. Now it’s right there, but I can’t get it out.",
    "dream_node_26": "I hope that’s all it is.\nI put the note down and picked it up again. The name had moved to the other side.\nWant to take a look?",
    "dream_node_27": "Enough looking. I’ll put it away.\nThere is something I want to ask you, though. When you really wake up, will you remember this place?",
    "dream_node_28": "Then, when you wake up, see if that shop still has its lights on for me.\n…Never mind. You don’t even know which street it’s on.\nJust remember someone waited for you here.",
    "dream_node_29": "Then don’t force yourself to remember.\nCome back, and I’ll tell you again.\nI don’t have much here, but I’ve got plenty of time.",
    "dream_node_3": "The gatekeeper.\nThough if you’re hoping to get in, don’t look to me. I don’t even have a key.",
    "dream_node_30": "I’m not in a hurry.\nIf you ever dream of this door again, don’t knock straight away.\nCall out to me first. So I don’t go on thinking I’m alone.",
    "dream_node_31": "Call me the gatekeeper.\n\n…You really did read all of this.\nI was wondering which line you’d close the window at.",
    "dream_node_32": "All right. My turn to ask, then.\nIf this really is a dream, how would you describe this part when you wake up?",
    "dream_node_33": "Good. Don’t remember the door and forget about me.\n\nI can’t think of anything else just now.\nIf you’re not in a hurry, sit with me for a bit.",
    "dream_node_34": "Yeah. See you next time.\n\nJust say hello when you come back.\nI won’t stop you with that line about how close we are.\n\nI’ll know it’s you.",
    "dream_node_35": "…Look. “Exit” is back.\nI was so busy talking to you, I didn’t notice.\n\nIt does know how to pick its moment.",
    "dream_node_4": "I’ve never been inside.\nOnce, a note slipped under the door. For a moment, I thought someone had finally sent me a key.",
    "dream_node_5": "“Come back when you wake up.”\nNo name. Just that one line.\nThen I turned it over. There was more on the back.",
    "dream_node_6": "There was once a world here.\nIts people had stories of their own.\nBut its creator has yet to finish it.",
    "dream_node_7": "I think so.\nI remember a street, and a shop there that always had its lights on.\nBut ask me its name, and I can’t remember.",
    "dream_node_8": "Yeah. Stay a little longer, if you’re not in a hurry.\nI don’t have any tea. Just conversation.",
    "dream_node_9": "…You could leave a moment ago.\nLooks like you’re trapped here, just like me.\nWait. Why are you looking at me?",
    "dream_option_10_0": "Then how do we get out?",
    "dream_option_11_0": "Are you dreaming?",
    "dream_option_12_0": "Then what are you doing in my dream?",
    "dream_option_13_0": "What happens now?",
    "dream_option_14_0": "The other side of the door.",
    "dream_option_14_1": "You haven’t told me why you’re here.",
    "dream_option_15_0": "Who wrote it?",
    "dream_option_15_1": "Perhaps I’ve been here before.",
    "dream_option_16_0": "Are you waiting for them?",
    "dream_option_16_1": "Are you sure you’re the gatekeeper?",
    "dream_option_17_0": "Did you write it in a dream?",
    "dream_option_17_1": "Someone could have copied it.",
    "dream_option_18_0": "Are you mistaking me for someone else?",
    "dream_option_18_1": "Try to remember.",
    "dream_option_19_0": "Have you tried knocking?",
    "dream_option_19_1": "Don’t you want to see inside?",
    "dream_option_1_0": "How do we get closer?",
    "dream_option_1_1": "I’ll leave you to it, then.",
    "dream_option_20_0": "Keep it a little longer, then.",
    "dream_option_20_1": "Do you think that person is me?",
    "dream_option_21_0": "Perhaps you did.",
    "dream_option_21_1": "Keep it for now. Don’t lose it.",
    "dream_option_22_0": "All right. Let’s start again.",
    "dream_option_22_1": "Don’t forget this time.",
    "dream_option_23_0": "I’ll wait with you for a bit.",
    "dream_option_23_1": "Enough knocking. Let’s take a break.",
    "dream_option_24_0": "Whose name is it?",
    "dream_option_24_1": "Maybe you didn’t look properly before.",
    "dream_option_25_0": "That happens to me, too.",
    "dream_option_25_1": "Don’t say it. This is getting a bit unsettling.",
    "dream_option_26_0": "Put it down. I’m not touching it.",
    "dream_option_26_1": "Stop turning it over. It’s getting stranger.",
    "dream_option_27_0": "I will. I’ll remember you.",
    "dream_option_27_1": "I forget my dreams when I wake up.",
    "dream_option_28_0": "You’d better wait, then.",
    "dream_option_28_1": "Aren’t you worried I’ll forget?",
    "dream_option_29_0": "Then I’ll ask again next time.",
    "dream_option_29_1": "You wouldn’t mind?",
    "dream_option_2_0": "Then who are you?",
    "dream_option_2_1": "I was just having a look.",
    "dream_option_30_0": "All right. I’ll call out to you first.",
    "dream_option_30_1": "Then you’ll have to tell me your name first.",
    "dream_option_31_0": "Let’s talk a little more, then.",
    "dream_option_31_1": "Let’s leave it here for today. See you next time.",
    "dream_option_32_0": "I dreamed of a very talkative gatekeeper.",
    "dream_option_32_1": "I dreamed of someone pretending not to know me.",
    "dream_option_33_0": "Yeah. Let’s sit for a bit.",
    "dream_option_33_1": "I’ll head back, then.",
    "dream_option_34_0": "See you next time, gatekeeper.",
    "dream_option_34_1": "I’ll hold you to that.",
    "dream_option_35_0": "Really, nothing else?",
    "dream_option_35_1": "Exit",
    "dream_option_3_0": "What’s behind the door?",
    "dream_option_3_1": "I’ll leave you to it.",
    "dream_option_4_0": "What did it say?",
    "dream_option_4_1": "I’ll let you wait. I’m heading out.",
    "dream_option_5_0": "What’s on the back?",
    "dream_option_5_1": "You carry on reading. I’m heading out.",
    "dream_option_6_0": "Are you from that world, too?",
    "dream_option_6_1": "I’ll leave that world in peace.",
    "dream_option_7_0": "So you never left?",
    "dream_option_7_1": "I’ll leave you in peace.",
    "dream_option_8_0": "Let’s talk a little longer, then.",
    "dream_option_8_1": "No, I should go.",
    "dream_option_9_0": "Was this your doing?",
    "dream_secret": "I’m keeping count, you know.\nFifty clicks. You kept going even when the words ran out.\n\n…If you’re that reluctant to leave, why don’t you come talk to me?\n\nNext time we meet, just ask, “Where’s my milk tea?”\nIt’s on me.",
    "dream_secret_title": "Congratulations. You found the Easter egg.",
    "thought_dream_core": "Memory, emotion and imagination, woven into another narrative. Here I record 18 dreams that move me deeply and intensely: over 7,800 Chinese characters including their interpretations. They guide me towards addressing what is missing and becoming whole.",
    "thought_dream_title": "Dream Interpretations",
    "dream_departure": "You’re awake. What about me?",
    "dream_choices_aria": "Your reply",
    "dream_close": "Close window"
};
    Object.assign(global.ZH, zh);
    Object.assign(global.EN, en);
    global.DreamDialogueData = { nodes: nodes, bubbles: bubbles };
})(window);
