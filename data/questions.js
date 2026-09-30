export const cinema = [
["find out","Stranger Things","We need to _____ the truth about what happened in this town.","find out","give up|put off|look over","Find out means to discover or learn information."],
["give up","The Pursuit of Happyness","Don't let a difficult situation make you _____.","give up","turn down|run out|take off","Give up means to stop trying."],
["turn down","Friends","Could you please _____ the music? It's too loud to talk.","turn down","turn up|bring up|carry on","Turn down can mean to reduce the volume."],
["put off","Interstellar","We can't afford to _____ the launch any longer.","put off","get along|hold on|stand for","Put off means to postpone or delay."],
["look over","Sherlock","Let's _____ the evidence one more time.","look over","break down|set up|fall apart","Look over means to examine or check."],
["carry on","The Lord of the Rings","We must _____ and keep moving forward.","carry on","log out|drop out|check in","Carry on means to continue."],
["figure out","Wednesday","We need to _____ what happened before we leave.","figure out","take over|run into|put away","Figure out means to understand or solve."],
["come up with","The Maze Runner","We need to _____ a plan before we enter.","come up with","run out|turn into|get over","Come up with means to think of an idea or plan."],
["deal with","The Hunger Games","We need to _____ this problem before it gets worse.","deal with","look up|take after|go off","Deal with means to handle a problem."],
["put together","Sherlock","Let's _____ all the information and find the connection.","put together","take away|go through|get away","Put together means to combine separate pieces."],
["back off","Spider-Man","You should _____ before things get more complicated.","back off","bring up|look after|fill in","Back off means to stop interfering or putting pressure on someone."],
["take off","Interstellar","The spacecraft is ready to _____ in a few minutes.","take off","give back|look after|put off","Take off means to leave the ground for an aircraft or spacecraft."]
].map(([verb,source,sentence,answer,distractors,explanation])=>({verb,source,sentence,answer,options:[answer,...distractors.split("|")],explanation}));

export const fill = [
["find out","I don't know yet, but I'll _____.","find out","Discover information."],
["give up","The task is hard, but don't _____.","give up","Stop trying."],
["put off","We shouldn't _____ the meeting again.","put off","Postpone something."],
["carry on","It was difficult, but she decided to _____.","carry on","Continue."],
["figure out","Can you help me _____ how it works?","figure out","Understand or solve."],
["look after","Can you _____ my dog this weekend?","look after","Take care of."],
["turn down","Please _____ the volume.","turn down","Reduce the volume."],
["come up with","We need to _____ a better idea.","come up with","Think of an idea."]
].map(([verb,sentence,answer,explanation])=>({verb,sentence,answer,explanation}));
