(function ($, BB, _) {

	var App = Backbone.View.extend({
		el: "#comments",

		events: {
			'submit .reply': 'addOneComment'
		},

		initialize: function () {
			this.$input_name = $('#input-name');
			this.$input_message = $('#input-text');
			this.$comments_list = $('#comment_list');

			this.listenTo(this.collection, 'add', this.createView);
			// Fetch contacts from server
			//this.collection.fetch();
		},

		clearInputs: function () {
			this.$input_name.val('');
			this.$input_message.val('');
		},

		addAllComments: function() {
			var that = this;
			this.collection.each(that.addOneComment);
		},

		addOneComment: function(evt) {
			evt.preventDefault();
			var _this = this;
			
			console.log(this.$input_name.val() + ':' +this.$input_message.val());
			var comment = new CommentModel({
				author: this.$input_name.val(),
				message: this.$input_message.val(),
				time_elapsed: new Date()
			});

			comment.save(null, {
				success: function (model, resp, options) {
					_this.collection.add(model);
				}, 
				error: function (model, xhr, options) {
					alert('Error on save');
				}
			});
			
		},

		createView: function (model, collection) {
			//model.set('like', 0);
			var view = new CommentView({model: model});
			this.$comments_list.append(view.render().el);
			this.clearInputs();
		}			
	});

	var CommentModel = Backbone.Model.extend({
		initialize: function() {
			//this.on('add', this.addHandler, this);
		},		

		idAttribute: '_id',

		defaults: {
			upvotes: 0,
			author: '-',
			message: '-',
			time_elapsed: '-'
		},

		validate: function(attributes) {
			var errors = [];

			if (attributes.text === "") {
				return 'Insert a text for the comment';
			}

			if (errors.length !== 0) {
				return errors;
			}
		},

		urlRoot: 'http://localhost:9090/comments',

		addHandler: function() {
			if (this.isNew()) {
				this.set({
					date: new Date()
				});
			}			
		},

		addLike: function() {
			var likeN = this.get('like') - 0;
			likeN++;
			this.set({
				like: likeN
			});
		}

	});

var CommentCollection = Backbone.Collection.extend({
	model: CommentModel,
	// The url to call for any interaction with the server
	url: 'http://localhost:9090/comments'
});

var CommentView = Backbone.View.extend({
	tagName: 'li',
	template: $('#comment_template').html(),
	events: {
		'click .upvote': 'upvote',
		'click .delete': 'remove'
	},


	initialize: function() {
		this.listenTo(this.model, 'destroy', this.removeView);

		this.listenTo(this.model, 'change', this.showDefaultView);
	},

	render: function() {
		var compiledTemplate = _.template(this.template);
		this.$el.html(compiledTemplate(this.model.toJSON()));
		return this;
	},

	upvote: function() {	

		this.model.addLike();		

		this.model.save();
	},

	remove: function() {
		var that = this;
		this.model.destroy();
		this.$el.remove();
	}
});

var commentApp = new App({ collection: new CommentCollection() });


})(jQuery, Backbone, _)