var Poll = function (
    title, description, votingOpens, votingCloses,
    votingSystem, opt_options, opt_votes, opt_pollId
) {

    var self = this;

    self.options = opt_options || ko.observableArray();
    self.votes = opt_votes || ko.observableArray();
    self.id = opt_pollId;
    self.title = title;
    self.description = description;
    self.votingOpens  = ko.observable(Date.parse(votingOpens));
    self.votingCloses = ko.observable(Date.parse(votingCloses));
    self.votingSystem = votingSystem;

    self.removeVote = function (vote) {
        self.votes.remove(vote);
        self.options.push(vote);
    };

    self.votes.subscribe(function () {
        var i = self.votes().length;
        while (i) {
            i--;
            self.votes()[i].rank(i + 1);
        }
    });

};
Poll.prototype.castVote = function (option, self) {
    self.options.remove(option);
    self.votes.push(option);
};
Poll.prototype.voteDragStart = function (vote) {
    vote.dragging(true);
};
Poll.prototype.voteDragEnd = function (vote) {
    vote.dragging(false);
};
Poll.prototype.voteReorder = function (e, selectedVote, zoneData, c) {
    if (selectedVote.id !== zoneData.item.id) {
        var zoneDataIndex = zoneData.items.indexOf(zoneData.item);
        zoneData.items.remove(selectedVote);
        zoneData.items.splice(zoneDataIndex, 0, selectedVote);
    }
};

Poll.prototype.isOpen   = function () {
    return (new Date()) < this.votingCloses();
};

Poll.prototype.isClosed = function () {
    return !this.isOpen();
};

Poll.prototype.status = function () {
    return this.isOpen() ? 'open' : 'closed';
};

var VoteList = function () {
    var self = this;
    self.options = ko.observableArray();
};

var Option = function (title, opt_optionId) {
    var self = this;

    self.id      = opt_optionId;
    self.title   = ko.observable(title);
    self.rank    = ko.observable();
    self.visible = ko.observable(true);
    self.dragging = ko.observable(false);
};

var options = ko.observableArray(
    [
        new Option('Cocopops', 4),
        new Option('Weetos', 2),
        new Option('Wheetabix', 1),
        new Option('Readybreak', 11),
        new Option('Lucky Charms', 3),
        new Option('Porridge', 12)
    ]
);

var poll = new Poll(
    'Favourite cereal?',
    'Breakfast is the most important meal of the day or something.',
    '2016-10-30T11:14:54Z',
    '2016-11-06T11:14:54Z',
    'instant runoff',
    options
);

ko.applyBindings(poll);
