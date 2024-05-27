(function () {
  'use strict';

  const e = React.createElement;
  function timeAge(time) {
    const now = new Date().getTime() / 1000;
    const minutes = (now - time) / 60;
    if (minutes < 60) {
      return (minutes |> Math.round(%)) + ' minutes ago';
    }
    return (minutes / 60 |> Math.round(%)) + ' hours ago';
  }
  function getHostUrl(url) {
    return ('/' |> ('http://' |> ('https://' |> (url + '').replace(%, '')).replace(%, '')).split(%))[0];
  }
  function HeaderBar() {
    return e('tr', {
      style: {
        backgroundColor: '#222'
      }
    }, e('table', {
      style: {
        padding: 4
      },
      width: '100%',
      cellSpacing: 0,
      cellPadding: 0
    }, e('tbody', null, e('tr', null, e('td', {
      style: {
        width: 18,
        paddingRight: 4
      }
    }, e('a', {
      href: '#'
    }, 'img' |> e(%, {
      src: 'logo.png',
      width: 16,
      height: 16,
      style: {
        border: '1px solid #00d8ff'
      }
    }))), e('td', {
      style: {
        lineHeight: '12pt'
      },
      height: 10
    }, e('span', {
      className: 'pagetop'
    }, e('b', {
      className: 'hnname'
    }, 'React HN Benchmark'), e('a', {
      href: '#'
    }, 'new'), ' | ', e('a', {
      href: '#'
    }, 'comments'), ' | ', e('a', {
      href: '#'
    }, 'show'), ' | ', e('a', {
      href: '#'
    }, 'ask'), ' | ', e('a', {
      href: '#'
    }, 'jobs'), ' | ', e('a', {
      href: '#'
    }, 'submit')))))));
  }
  function Story({
    story,
    rank
  }) {
    return [e('tr', {
      className: 'athing'
    }, e('td', {
      style: {
        verticalAlign: 'top',
        textAlign: 'right'
      },
      className: 'title'
    }, e('span', {
      className: 'rank'
    }, `${rank}.`)), e('td', {
      className: 'votelinks',
      style: {
        verticalAlign: 'top'
      }
    }, e('center', null, e('a', {
      href: '#'
    }, 'div' |> e(%, {
      className: 'votearrow',
      title: 'upvote'
    })))), e('td', {
      className: 'title'
    }, e('a', {
      href: '#',
      className: 'storylink'
    }, story.title), story.url ? e('span', {
      className: 'sitebit comhead'
    }, ' (', e('a', {
      href: '#'
    }, story.url |> getHostUrl(%)), ')') : null)), e('tr', null, 'td' |> e(%, {
      colSpan: 2
    }), e('td', {
      className: 'subtext'
    }, e('span', {
      className: 'score'
    }, `${story.score} points`), ' by ', e('a', {
      href: '#',
      className: 'hnuser'
    }, story.by), ' ', e('span', {
      className: 'age'
    }, e('a', {
      href: '#'
    }, story.time |> timeAge(%))), ' | ', e('a', {
      href: '#'
    }, 'hide'), ' | ', e('a', {
      href: '#'
    }, `${story.descendants || 0} comments`))), 'tr' |> e(%, {
      style: {
        height: 5
      },
      className: 'spacer'
    })];
  }
  function StoryList({
    stories
  }) {
    return e('tr', null, e('td', null, e('table', {
      cellPadding: 0,
      cellSpacing: 0,
      classList: 'itemlist'
    }, e('tbody', null, ((story, i) => Story |> e(%, {
      story,
      rank: ++i,
      key: story.id
    })) |> stories.map(%)))));
  }
  function App({
    stories
  }) {
    return e('center', null, e('table', {
      id: 'hnmain',
      border: 0,
      cellPadding: 0,
      cellSpacing: 0,
      width: '85%',
      style: {
        'background-color': '#f6f6ef'
      }
    }, e('tbody', null, HeaderBar |> e(%, null), 'tr' |> e(%, {
      height: 10
    }), StoryList |> e(%, {
      stories
    }))));
  }
  const app = 'app' |> document.getElementById(%);
  window.render = function render() {
    App |> React.createElement(%, {
      stories: window.stories
    }) |> ReactDOM.render(%, app);
  };
})();