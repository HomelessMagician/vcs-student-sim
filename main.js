const [clicks] = (() => {

  const config = {
    MAX_Volunteer_Hour: 50
  };

  const gameState = {
    accumulativeDay: 0,
    day: 0,
    time: 16,
    volunteerHours: 0,
    homeworks: 0,
    hwRate: 3,
    sleeplessNights: 0,
    tests: 0,
    grade: 100,
    friends: 3,
    testReadiness: 0,
    testsTaken: 1,
    friendExpectation: 3,
    continueResolve: null,
    scolded: false,
    totalVolunteerHours: 0,
    absences: 0,
    warned: false,
    retakeTests: 0,
    avgSleepLength: null,
    reported: false,
    gender: 'they',
    royShinArc: 0,
    teacherCaught: false,
    cheatingGCArc: false,
    cheatingRoyArc: false,
    wokeness: 50,
  
  };


window.gameState= gameState;



  function updateHomework() {
    if (renderer.hwCount) {
      renderer.hwCount.textContent = gameState.homeworks;
    }
    if (renderer.tests) {
      renderer.tests.textContent = gameState.tests;
    }
    if (renderer.testReadiness) {
      renderer.testReadiness.textContent =
        Math.round(gameState.testReadiness * 100) / 100;
    }

    // Homework
    if (renderer.doHWBtn) {
      if (gameState.homeworks === 0) {
        disableBtn(renderer.doHWBtn, 'No more homework!');
      } else {
        enableBtn(renderer.doHWBtn);
      }
    }

    // Study for tests
    if (renderer.studyBtn) {
      if (!gameState.tests) {
        disableBtn(renderer.studyBtn, 'You don\'t have a test tomorrow!');
      } else {
        enableBtn(renderer.studyBtn);
      }
    }

    // Volunteer is always available (unless scolded)
    if (renderer.volunteerBtn) {
      enableBtn(renderer.volunteerBtn);
    }

    if (gameState.scolded) {
      if (renderer.volunteerBtn) {
        disableBtn(renderer.volunteerBtn, 'You cannot concentrate because your parents are scolding you.');
      }
      if (renderer.studyBtn) {
        disableBtn(renderer.studyBtn, 'You cannot concentrate because your parents are scolding you.');
      }
      if (renderer.doHWBtn) {
        disableBtn(renderer.doHWBtn, 'You cannot concentrate because your parents are scolding you.');
      }
    }
  }

  function addHours(hours, atHome) {
    gameState.time += hours;
    gameState.day = Math.floor(gameState.time / 24) % 5;
    renderer.time.textContent = humanTime(gameState.time % 24);
    renderer.day.textContent = dayNames[gameState.day];
    if (atHome) {
      if (Math.floor((gameState.time - 8) / 24) > gameState.accumulativeDay) {
        gameState.sleeplessNights++;
        if (gameState.accumulativeDay === 0) {
          gameState.avgSleepLength = 0;
        } else {
          gameState.avgSleepLength = gameState.avgSleepLength * gameState.accumulativeDay / (gameState.accumulativeDay + 1);
        }
        beginSchool();
      }
    }
  }

  function schoolContinue() {
    return new Promise(res => gameState.continueResolve = res);
  }

  async function assembly(lines, customHeading = 'ASSEMBLY') {
    let skip = false, skipBtn;
    renderer.schoolContent.appendChild(createFragment([
      '\n',
      span(customHeading.toLowerCase() + '-heading', customHeading),
      ' ',
      skipBtn = span('button', '[skip]', () => {
        skip = true;
        if (gameState.continueResolve) gameState.continueResolve();
      }),
      '\n',
      '\n'
    ]));
    for (let i = 0; i < lines.length; i++) {
      renderer.schoolContent.appendChild(createFragment([
        span('assembly-line-' + lines[i].slice(0, 2), lines[i].slice(4)),
        '\n',
        '\n'
      ]));
      if (!skip) await schoolContinue();
    }
    skipBtn.classList.add('disabled');
  }

  async function triggerChoiceEvent(promptText, options) {
    let resolve, promise = new Promise(res => resolve = res);
    renderer.schoolContBtn.classList.add('disabled');

    const optionElements = options.map((opt, index) =>
      span('button', `[${opt.label}]`, () => resolve(index))
    );

    const fragContent = [span('', promptText), '\n'];
    optionElements.forEach(el => fragContent.push(' ', el));
    fragContent.push('\n\n');

    renderer.schoolContent.appendChild(createFragment(fragContent));

    const choiceIndex = await promise;
    renderer.schoolContBtn.classList.remove('disabled');
    optionElements.forEach(el => el.classList.add('disabled'));

    return options[choiceIndex].action();
  }

  async function beginSchool() {

    if (renderer.volunteerBtn) disableBtn(renderer.volunteerBtn, 'You\'re at school!');
    if (renderer.doHWBtn) disableBtn(renderer.doHWBtn, 'You\'re at school!');
    if (renderer.sleepBtn) disableBtn(renderer.sleepBtn, 'You\'re at school!');
    if (renderer.studyBtn) disableBtn(renderer.studyBtn, 'You\'re at school!');
    if (gameState.scolded) gameState.scolded = false;
    gameState.accumulativeDay++;


    // 100-day Win Condition
    if (gameState.accumulativeDay >= 100) {
      while (document.body.children.length) {
        if (document.body.lastChild !== this.floatingBar)
          document.body.removeChild(document.body.lastChild);
        else break;
      }
      document.body.appendChild(createFragment([
        renderer.schoolContent = span(),
        renderer.schoolContBtn = span('button', '[ok]', clicks.schoolContinue)
      ]));

      // --- VOLUNTEER HOUR PENALTY CHECK ---
      if (gameState.volunteerHours < 50) {
        gameState.grade -= 20;
        renderer.schoolContent.appendChild(createFragment([
          span('', 'WARNING: You failed to complete the required 50 volunteer hours. Your final grade drops by 20%!'),
          '\n\n'
        ]));
        await schoolContinue();
      }

     if (gameState.friends === 0 && gameState.grade < 70) {
        renderer.schoolContent.appendChild(createFragment([
          span('parents-heading', 'CRISIS POINT'),
          '\n\n'
        ]));
        await triggerChoiceEvent(
          "With the volunteer penalty dropping your grade below 70% and having 0 friends left, everything crashes down on graduation day. There are only two ways this can end.",
          [
            {
              label: "Suicide",
              action: async () => {
                renderer.schoolContent.appendChild(createFragment([
                  '\n',
                  span('', 'The sky looks beautiful from here doesn\'t it.'),
                  '\n\n',
                  span('', 'You take a deep breath, but are stopped short by the sudden noise of footsteps on the stairs.'),
                  '\n\n',
                  span('', 'Teachers run over to stop you, but it is too late. You climb over the barrier and fall down from the conservatory roof.'),
                  '\n\n',
                  span('end-msg', 'ENDING: death'),
                  '\n\n',
                  span('the-end', 'GAME OVER'),
                  '\n\n',
                  span('button', '[try again]', clicks.reload)
                ]));
              }
            },
            {
              label: "U2Nob29sIFNob290aW5nCg==",
              action: async () => {
                renderer.schoolContent.appendChild(createFragment([
                  '\n',
                  span('', 'Blood spurts from a students\'s head. Screams echo across the classroom and spill out into the hall.'),
                  '\n\n',
                  span('', 'Your former classmates try to run, but they can\'t get very far. With you blocking the only doorway, the only way out is the realm of the Grim Reaper...'),
                  '\n\n',
                  span('', 'You move through the halls, going from classroom after classroom. They\'ll get you in the end, but what does it matter now?'),
                  '\n\n',
                  span('end-msg', 'ENDING: death'),
                  '\n\n',
                  span('the-end', 'GAME OVER'),
                  '\n\n',
                  span('button', '[try again]', clicks.reload)
                ]));
              }
            }
          ]
        );
        return;
      }

      // 2. Check for DISOWNMENT next (Grade < 80%)
      if (gameState.grade < 80) {
        renderer.schoolContent.appendChild(createFragment([
          span('parents-heading', 'HOME'),
          '\n\n',
          span('', 'Your parents inspect your final report card after the volunteer penalty... and stand at the door, visibly disappointed and angry.'),
          '\n\n',
          span('end-msg', 'You have been disowned.'),
          '\n\n',
          span('the-end', 'GAME OVER'),
          '\n\n',
          span('button', '[try again]', clicks.reload)
        ]));
        renderer.schoolContBtn.classList.add('hidden');
        return;
      }

      // win
      const finalGPA = Math.round(gameState.grade * 100) / 100;
      const finalHours = gameState.volunteerHours;

      await assembly([
        '--: You have successfully survived 100 days at VCS school!',
        `--: Final Academic Grade: ${finalGPA}%`,
        `--: Total Volunteer Hours: ${finalHours} hrs`,
        '--: You are ready to take on whatever comes next.'
      ], 'GRADUATION');

      document.body.removeChild(renderer.schoolContBtn);
      document.body.appendChild(createFragment([
        span('the-end', 'YOU WIN! (100 DAYS SURVIVED)'),
        '\n\n',
        span('button', '[play again]', clicks.reload)
      ]));
      return;
    }

    // Interactive Daily Events
    const interactiveEvents = {
      2: async () => {
        await triggerChoiceEvent(
          "A student named Roy Shin approaches you. He wants homework answers and threatens you for them.",
          [
            { label: "Tell him to fuck off", action: () => { gameState.royShinArc++; } },
            { label: "Give him the info", action: () => { gameState.friends++; gameState.cheatingRoyArc = true;} },
          ]
        );
      },
      
      6: async () => {
        await triggerChoiceEvent(
          "A group of students asks you to join their study group chat. It seems sketchy.",
          [
            { label: "Join", action: () => { gameState.cheatingGCArc = true; gameState.friends += 5; } },
            { label: "Decline", action: () => {} }
          ]
        );
      },
      9: async () => {
        renderer.schoolContent.appendChild(createFragment([
          span('', 'You forgot your calculator on the day of the first math test. You end up missing your first class to go back home and get it'),
          "\n\n"
        ]));
        gameState.absences++;

      },
      11: async () => {
        if (gameState.royShinArc === 1) {
          await triggerChoiceEvent(
            "Roy Shin sees you again in the halls. He tells you to come fight him after school.",
            [
              { label: "Laugh it off and walk away", action: () => {gameState.royShinArc++; } },
              { label: "shrug", action: () => {gameState.royShinArc++; } }
            ]
          );
        } else {
          renderer.schoolContent.appendChild(createFragment([
            span('', 'There\'s a fire drill. You end up getting more homework.'),
            "\n\n"
          ]));
          gameState.homeworks += 1;
        }     
      },
      14: async () => {
        if (gameState.cheatingRoyArc === true){
          renderer.schoolContent.appendChild(createFragment([
            span('', 'The admin found out that Roy Shin was cheating. He ended up snitching on you, and you get expelled.'),
            '\n\n',
            span('end-msg', 'You have been suspended.'),
            '\n\n',
            span('the-end', 'GAME OVER'),
            '\n\n',
            span('button', '[try again]', clicks.reload)
      ]));
          renderer.schoolContBtn.classList.add('hidden');
          renderer.volunteerBtn.dataset.title = 'You aren\'t in school anymore!';
          renderer.doHWBtn.dataset.title = 'You aren\'t in school anymore!';
          if (renderer.volunteerBtn) renderer.volunteerBtn.dataset.title = 'You aren\'t in school anymore!';
          renderer.sleepBtn.dataset.title = 'You aren\'t in school anymore!';
          return;
        }

        renderer.schoolContent.appendChild(createFragment([
          span('', 'Rumors spread of a group that knows all the test answers. You gain some info from listening to conversations.'),
          '\n\n',
        ]));
        gameState.testReadiness += 15;
      },
    };
    if (gameState.accumulativeDay === 1) {
      if (!renderer.grade) {
        document.body.insertBefore(createFragment([
          ' ',
          span('grade-heading', 'GRADE'),
          ' ',
          renderer.grade = span('grade', '100', null, 'Must be at least 90%'),
          '%'
        ]), renderer.gradeMarker);
      }
      document.body.appendChild(createFragment([
        '\n\n',
        renderer.school = span('', [
          span('school-heading', 'SCHOOL'),
          '\n',
          renderer.schoolContent = span(),
          renderer.schoolContBtn = span('button', '[ok]', clicks.schoolContinue)
        ])
      ]));
    } else {
      if (renderer.school) {
        renderer.school.classList.remove('hidden');
        enableBtn(renderer.schoolContBtn);
      }
    }    

    if (interactiveEvents[gameState.accumulativeDay]) {
      await interactiveEvents[gameState.accumulativeDay]();
    }



    let testsToRetake = 0;

    // Absence system
    if (gameState.absences === 3 && !gameState.warned) {
      renderer.schoolContent.appendChild(createFragment([
        span('', 'The school pulled you out of class to warn you about your absences. Five unexcused absences will lead to suspension.' + (gameState.tests ? ' You end up missing your test(s) and will have to take them tomorrow.' : '')),
        '\n'
      ]));
      testsToRetake = gameState.tests;
      gameState.warned = true;
      await schoolContinue();
    } else if (gameState.absences >= 5) {
      renderer.schoolContent.appendChild(createFragment([
        '\n',
        span('', 'You now have five unexcused absences. The school must follow district policy.'),
        '\n\n',
        span('end-msg', 'You have been suspended.'),
        '\n\n',
        span('the-end', 'GAME OVER'),
        '\n\n',
        span('button', '[try again]', clicks.reload)
      ]));
      renderer.schoolContBtn.classList.add('hidden');
      renderer.volunteerBtn.dataset.title = 'You aren\'t in school anymore!';
      renderer.doHWBtn.dataset.title = 'You aren\'t in school anymore!';
      if (renderer.volunteerBtn) renderer.volunteerBtn.dataset.title = 'You aren\'t in school anymore!';
      renderer.sleepBtn.dataset.title = 'You aren\'t in school anymore!';
      return;
    } else if (gameState.sleeplessNights > 2 && gameState.tests) {
      renderer.schoolContent.appendChild(createFragment([
        span('', 'You didn\'t sleep enough and ended up sleeping during the test(s).'),
        '\n'
      ]));
      for (let i = 0; i < gameState.tests; i++) {
        gameState.grade = (gameState.grade * gameState.testsTaken) / (gameState.testsTaken + 1);
        gameState.testsTaken++;
      }
      renderer.grade.textContent = Math.round(gameState.grade * 100) / 100;
      await schoolContinue();
    } else if (!gameState.reported && gameState.avgSleepLength != null && gameState.avgSleepLength < 3 && Math.random() < 0.2) {
      renderer.schoolContent.appendChild(createFragment([
        span('', 'The school pulled you out of class because a student reported you for looking exhausted.' + (gameState.tests ? ' You miss your test(s) and will have to take them tomorrow.' : '')),
        '\n'
      ]));
      testsToRetake = gameState.tests;
      gameState.reported = true;
      await schoolContinue();
    } else {
      for (let i = 0; i < gameState.tests - gameState.retakeTests; i++) {
        const threshold = Math.random() * 50 + 25;
        const score = Math.min(100, gameState.testReadiness + 100 - threshold);
        gameState.grade = (gameState.grade * gameState.testsTaken + score) / (gameState.testsTaken + 1);
        renderer.grade.textContent = Math.round(gameState.grade * 100) / 100;
        gameState.testsTaken++;
        renderer.schoolContent.appendChild(createFragment([
          span('', `You receive ${Math.round(score * 100) / 100}% on a test.`),
          '\n'
        ]));
        await schoolContinue();
      }
    }

    gameState.grade -= gameState.homeworks;
    renderer.grade.textContent = Math.round(gameState.grade * 100) / 100;

    if (gameState.accumulativeDay === 2) {
      await assembly([
        '--: Representatives wave to the audience.',
        'cc: Good morning! Today, we are giving you a challenge: maintain at least THREE friendships!'
      ]);
      document.body.insertBefore(createFragment([
        ' ',
        span('friend-heading', 'FRIENDS'),
        ' ',
        renderer.friends = span('friends', '3', null, 'You need a minimum of 3 friends.')
      ]), renderer.gradeMarker);
    }

    gameState.hwRate += 0.3;
    gameState.homeworks += Math.floor(gameState.hwRate);
    if (renderer.hwCount) renderer.hwCount.textContent = gameState.homeworks;
    gameState.tests = Math.floor(Math.random() * (gameState.hwRate / 2)) + testsToRetake;
    if (renderer.tests) renderer.tests.textContent = gameState.tests;
    gameState.testReadiness = 0;
    if (renderer.testReadiness) renderer.testReadiness.textContent = gameState.testReadiness;

    renderer.schoolContent.appendChild(createFragment([
      span('', `You leave school with ${Math.floor(gameState.hwRate)} more homework assignment(s) and ${gameState.tests} test(s) to prepare for tomorrow.`),
      '\n\n'
    ]));
    await schoolContinue();
    addHours(8);

    let hoursLeft = Math.ceil((gameState.time - 8) / 24) * 24 + 8 - gameState.time;

    // Crisis point
    if (gameState.friends === 0 && gameState.grade < 70) {
      renderer.schoolContent.appendChild(createFragment([
        '\n',
        span('parents-heading', 'CRISIS POINT'),
        '\n'
      ]));

      await triggerChoiceEvent(
        "You have 0 friends left and your grade has fallen below 70%. It's only going to get worse from here. What do you do?",
        [
          {
            label: "Suicide",
            action: async () => {
              renderer.schoolContent.appendChild(createFragment([
                '\n',
                span('', 'The sky looks beautiful from here doesn\'t it.'),
                '\n\n',
                span('', 'You take a deep breath, but are stopped short by the sudden noise of footsteps on the stairs.'),
                '\n\n',
                span('', 'Teachers run over to stop you, but it is too late. You climb over the fence and fall down from the conservatory roof.'),
                '\n\n',
                span('end-msg', 'ENDING: death'),
                '\n\n',
                span('the-end', 'GAME OVER'),
                '\n\n',
                span('button', '[try again]', clicks.reload)
              ]));
            }
          },
          {
            label: "U2Nob29sIFNob290aW5nCg==",
            action: async () => {
              renderer.schoolContent.appendChild(createFragment([
                '\n',
                span('', 'Blood spurts from a classmate\'s head. Screams echo across the classroom and spill out into the hall.'),
                '\n\n',
                span('', 'Your former classmates try to run, but they can\'t get very far. With you blocking the only doorway, the only way out is the realm of the Grim Reaper...'),
                '\n\n',
                span('', 'You move through the halls, going from classroom after classroom. They\'ll get you in the end, but what does it matter now?'),
                '\n\n',
                span('end-msg', 'ENDING: death'),
                '\n\n',
                span('the-end', 'GAME OVER'),
                '\n\n',
                span('button', '[try again]', clicks.reload)
              ]));
            }
          }
        ]
      );
    }

    // Parent scolding / disowning
    if (gameState.grade < 90) {
      renderer.schoolContent.appendChild(createFragment([
        '\n',
        span('parents-heading', 'HOME'),
        '\n'
      ]));
      if (gameState.grade < 80) {
        renderer.schoolContent.appendChild(createFragment([
          '\n',
          span('', 'Your parents stand at the door, visibly disappointed and angry.'),
          '\n\n',
          span('end-msg', 'You have been disowned.'),
          '\n\n',
          span('the-end', 'GAME OVER'),
          '\n\n',
          span('button', '[try again]', clicks.reload)
        ]));
        renderer.schoolContBtn.classList.add('hidden');
        return;
      } else if (hoursLeft >= 3) {
        renderer.schoolContent.appendChild(createFragment([
          '\n',
          span('', 'Your parents enter your room and scold you for the entire night.'),
          '\n'
        ]));
        gameState.scolded = true;
        addHours(3);
        hoursLeft -= 3;
        await schoolContinue();
      }
    }

    if (hoursLeft <= 0) {
      renderer.schoolContent.appendChild(createFragment([
        span('', 'Alas, you have spent the rest of the day and must attend school again.'),
        '\n'
      ]));
      await schoolContinue();
    }

    updateHomework();

    if (renderer.volunteerBtn) enableBtn(renderer.volunteerBtn);
    if (renderer.doHWBtn) enableBtn(renderer.doHWBtn);
    if (renderer.sleepBtn) enableBtn(renderer.sleepBtn);
    if (renderer.studyBtn) enableBtn(renderer.studyBtn);
    if (renderer.school) renderer.school.classList.add('hidden');
    if (renderer.schoolContBtn) disableBtn(renderer.schoolContBtn);
    if (renderer.schoolContent) renderer.schoolContent.innerHTML = '';

    if (hoursLeft <= 0) addHours(0, true);
  }

  // ========== CLICK HANDLERS ==========
  const clicks = {
    volunteer() {
      if (gameState.volunteerHours < config.MAX_Volunteer_Hour) {
        gameState.volunteerHours++;
        gameState.totalVolunteerHours++;
      }
      if (renderer.volunteerPercent) {
        renderer.volunteerPercent.textContent = String(gameState.totalVolunteerHours);
      }
      addHours(1, true);
      updateHomework();
    },



    doHW() {
      gameState.homeworks--;
      updateHomework();
      addHours(1, true);
    },

    sleep() {
    const sleepLength = Math.ceil((gameState.time - 8) / 24) * 24 + 8 - gameState.time;
    gameState.sleeplessNights = 0;
    if (gameState.accumulativeDay === 0) {
      gameState.avgSleepLength = sleepLength;
    } else {
      gameState.avgSleepLength =
        (gameState.avgSleepLength * gameState.accumulativeDay + sleepLength) /
        (gameState.accumulativeDay + 1);
      }
      // advance time, then one school day
      addHours(sleepLength); // no atHome
      beginSchool();
    },


    schoolContinue() {
      if (gameState.continueResolve) {
        gameState.continueResolve();
        gameState.continueResolve = null;
      }
    },

    studyTest() {
    if (!gameState.tests) return;
    gameState.testReadiness += (Math.random() * 25 + 25) / gameState.tests;
    if (renderer.testReadiness) {
      renderer.testReadiness.textContent =
        Math.round(gameState.testReadiness * 100) / 100;
      }
      addHours(1, true);
      updateHomework();
    },

    reload() {
      window.location.reload();
    },

    closeDialog() {
      renderer.closeBtn.classList.add('disabled');
      renderer.dialog.classList.add('hidden');
      renderer.dialogContent.innerHTML = '';
    },

    showInfo() {
      renderer.dialogHeading.textContent = 'INFO';
      renderer.dialogContent.appendChild(createFragment([
        'Survive 100 days of school by balancing academics, homework, and test prep.\n\nYou can skip class, but too many absences will get you suspended.'
      ]));
    },

    showUpdates() {
      renderer.dialogHeading.textContent = 'UPDATES';
      renderer.dialogContent.appendChild(createFragment([
        '• Removed after-school wellness program (SELF)\n• Added [skip class] button\n• Absence / suspension system restored\n• Gender selector is now clickable'
      ]));
    },
    showScores() {
      renderer.dialogHeading.textContent = 'SCORES';
      renderer.dialogContent.appendChild(createFragment([
        'Local scores not implemented yet.'
      ]));
    },
    showModes() {
      renderer.dialogHeading.textContent = 'MODES';
      renderer.dialogContent.appendChild(createFragment([
        'No extra modes yet.'
      ]));
    }
};

  async function selectGender() {
    document.body.appendChild(createFragment([
      '\n\n',
      renderer.school = span('', [
        span('school-heading', 'CHARACTER CREATION'),
        '\n',
        renderer.schoolContent = span(),
        renderer.schoolContBtn = span('button hidden', '[ok]')
      ])
    ]));

    renderer.school.classList.remove('hidden');

    await triggerChoiceEvent(
      'Select your gender:',
      [
        { label: 'Male', action: () => { gameState.gender = 'male'; } },
        { label: 'Female', action: () => { gameState.gender = 'female'; } }
      ]
    );

    if (renderer.school && renderer.school.parentNode) {
      renderer.school.parentNode.removeChild(renderer.school);
    }
    renderer.school = null;
    renderer.schoolContent = null;
    renderer.schoolContBtn = null;
  }

  function startAfterSchoolDay1() {
  gameState.accumulativeDay = 0;
  gameState.time = 16;
  gameState.homeworks = 3;
  gameState.tests = 0;
  gameState.testReadiness = 0;

  renderer.time.textContent = humanTime(gameState.time % 24);
  renderer.day.textContent = dayNames[gameState.day];
  renderer.timeWrapper.classList.remove('hidden');

  document.body.insertBefore(createFragment([
    ' ',
    span('grade-heading', 'GRADE'),
    ' ',
    renderer.grade = span('grade', '100', null, 'Must be at least 90%'),
    '%',
    '\n',
    renderer.volunteerBtn = span('button', '[volunteer]', clicks.volunteer),
    '\n',
    span('', 'You have completed '),
    renderer.volunteerPercent = span('volunteer-percentage', '0'),
    span('', ' hours of community service.'),
    '\n',
    renderer.doHWBtn = span('button', '[do homework]', clicks.doHW),
    ' You have ',
    renderer.hwCount = span('homework-count', '3'),
    ' homework assignment(s) due.',
    renderer.testStudyMarker = span('hidden'),
    '\n',
    renderer.studyBtn = span('button', '[study for tests]', clicks.studyTest),
    ' You are ',
    renderer.testReadiness = span('test-readiness', '0'),
    '% ready for ',
    renderer.tests = span('upcoming-tests', '0'),
    ' test(s) tomorrow.',
    '\n',
    renderer.sleepBtn = span('button', '[sleep]', clicks.sleep),
    ' Don\'t forget to sleep so you do well on tests!'
  ]), renderer.gradeMarker);

  updateHomework();
}

  window.clicks = clicks;

  window.startGame = function () {
    selectGender().then(() => {
      startAfterSchoolDay1();
    });
  };

  return [clicks];

})();
