const [clicks] = (() => {

  const config = {
    MAX_Volunteer_Hour: 100
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
    const hour = gameState.time % 24;
    if (hour >= 8 && hour < 16) {
      if (renderer.doHWBtn) disableBtn(renderer.doHWBtn, "You're at school!");
      if (renderer.studyBtn) disableBtn(renderer.studyBtn, "You're at school!");
      updateVolunteerAvailability();
      return;
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
      } else if (gameState.testReadiness >= 100) {
        disableBtn(renderer.studyBtn, 'You are already 100% ready for your tests!');
      } else {
        enableBtn(renderer.studyBtn);
      }
    }


    if (gameState.scolded) {
      if (renderer.studyBtn) {
        disableBtn(renderer.studyBtn, 'You cannot concentrate because your parents are scolding you.');
      }
    }

    updateVolunteerAvailability();
  }
  function updateVolunteerAvailability() {
    if (!renderer.volunteerBtn) return;
    const hour = gameState.time % 24;
    if (hour >= 8 && hour < 16) {
      disableBtn(renderer.volunteerBtn, 'You\'re at school!');
      return;
    }

    

    if (gameState.scolded) {
      disableBtn(
        renderer.volunteerBtn,
        'You cannot concentrate because your parents are scolding you.'
      );
      return;
    }

    if (hour >= 20 || hour < 8) {
      disableBtn(renderer.volunteerBtn, "It's too late to volunteer");
      return;
    }

    if (gameState.totalVolunteerHours >= config.MAX_Volunteer_Hour) {
      disableBtn(renderer.volunteerBtn, 'You already finished your volunteer hours!');
      return;
    }

    enableBtn(renderer.volunteerBtn);
  }
  function ensureAbsencesUI() {
    if (renderer.absences) return;

    let anchor = renderer.friends || renderer.grade;
    if (!anchor || !anchor.parentNode) return;

    let insertBeforeNode = null;
    if (renderer.friends) {
      insertBeforeNode = renderer.friends.nextSibling;
    } else {
      const percentNode = renderer.grade.nextSibling; // '%'
      insertBeforeNode = percentNode ? percentNode.nextSibling : null;
    }

    anchor.parentNode.insertBefore(
      createFragment([
        ' ',
        span('absences-heading', 'ABSENCES', null, 'Too many absences lead to suspension.'),
        ' ',
        renderer.absences = span(
          'absences',
          String(gameState.absences),
          null,
          'Warning at 3, suspension at 5.'
        )
      ]),
      insertBeforeNode
    );
  }

  function updateAbsencesUI() {
    ensureAbsencesUI();
    if (renderer.absences) {
      renderer.absences.textContent = String(gameState.absences);
    }
  }
  function updateFriendsUI() {
    if (renderer.friends) {
      renderer.friends.textContent = String(gameState.friends);
    }
  }
  function ensureDayCounterUI() {
    if (renderer.dayCounter) return;

    // Anchor next to absences or friends
    let anchor = renderer.absences || renderer.friends || renderer.grade;
    if (!anchor || !anchor.parentNode) return;

    anchor.parentNode.insertBefore(
      createFragment([
        ' ',
        span('day-heading', 'DAY'),
        ' ',
        renderer.dayCounter = span(
          'day-counter',
          `${gameState.accumulativeDay}/100`
        )
      ]),
      anchor.nextSibling
    );
  }

  function updateDayCounterUI() {
    ensureDayCounterUI();
    if (renderer.dayCounter) {
      renderer.dayCounter.textContent = `${gameState.accumulativeDay}/100`;
    }
  }

  function addHours(hours, atHome) {
    gameState.time += hours;
    gameState.day = Math.floor(gameState.time / 24) % 5;
    renderer.time.textContent = humanTime(gameState.time % 24);
    renderer.day.textContent = dayNames[gameState.day];

    updateVolunteerAvailability();
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
    updateDayCounterUI();
    const hwBeforeSchool = gameState.homeworks;


    // 100 days
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

      if (gameState.volunteerHours < 100) {
        gameState.grade -= 20;
        renderer.schoolContent.appendChild(createFragment([
          span('', 'WARNING: You failed to complete the required 100 volunteer hours. Your final grade drops by 20%!'),
          '\n\n'
        ]));
        await schoolContinue();
      }

     if (gameState.friends === 0 && gameState.grade < 75) {
        renderer.schoolContent.appendChild(createFragment([
          span('parents-heading', 'CRISIS POINT'),
          '\n\n'
        ]));
        await triggerChoiceEvent(
          "With the volunteer penalty dropping your grade below 70% and having 0 friends left, everything crashes down on graduation day.",
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
                if (renderer.volunteerBtn) disableBtn(renderer.volunteerBtn, 'There\'s no school in the afterlife.');
                if (renderer.doHWBtn) disableBtn(renderer.doHWBtn, 'There\'s no school in the afterlife.');
                if (renderer.studyBtn) disableBtn(renderer.studyBtn, 'There\'s no school in the afterlife.');
                if (renderer.sleepBtn) disableBtn(renderer.sleepBtn, 'There\'s no school in the afterlife.');
              }
            }
            // {
            //   label: "I'm sick and twisted",
            //   action: async () => {
            //     renderer.schoolContent.appendChild(createFragment([
            //       '\n',
            //       span('', 'Blood spurts from a students\'s head. Screams echo across the classroom and spill out into the hall.'),
            //       '\n\n',
            //       span('', 'Your former classmates try to run, but they can\'t get very far. With you blocking the only doorway, the only way out is the realm of the Grim Reaper...'),
            //       '\n\n',
            //       span('', 'You move through the halls, going from classroom after classroom. They\'ll get you in the end, but what does it matter now?'),
            //       '\n\n',
            //       span('end-msg', 'ENDING: death'),
            //       '\n\n',
            //       span('the-end', 'GAME OVER'),
            //       '\n\n',
            //       span('button', '[try again]', clicks.reload)
            //     ]));
            //     if (renderer.volunteerBtn) disableBtn(renderer.volunteerBtn, 'There\'s no school in the afterlife.');
            //     if (renderer.doHWBtn) disableBtn(renderer.doHWBtn, 'There\'s no school in the afterlife.');
            //     if (renderer.studyBtn) disableBtn(renderer.studyBtn, 'There\'s no school in the afterlife.');
            //     if (renderer.sleepBtn) disableBtn(renderer.sleepBtn, 'There\'s no school in the afterlife.');
            //   }
            // }
          ]
        );
        return;
      }

      // 2. Check for DISOWNMENT next (Grade < 80%)
      if (gameState.grade < 80) {
        renderer.schoolContent.appendChild(createFragment([
          span('parents-heading', 'HOME'),
          '\n\n',
          span('', 'Your parents inspect your final report card... and stand at the door, visibly disappointed and angry. Your dad shakes his head and points away.'),
          '\n\n',
          span('end-msg', 'You have been disowned.'),
          '\n\n',
          span('the-end', 'GAME OVER'),
          '\n\n',
          span('button', '[try again]', clicks.reload)
        ]));
        renderer.schoolContBtn.classList.add('hidden');
        if (renderer.volunteerBtn) disableBtn(renderer.volunteerBtn, 'Find a family first!');
        if (renderer.doHWBtn) disableBtn(renderer.doHWBtn, 'Find a family first!');
        if (renderer.studyBtn) disableBtn(renderer.studyBtn, 'Find a family first!');
        if (renderer.sleepBtn) disableBtn(renderer.sleepBtn, 'Find a family first!');
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

    // daily events
    const interactiveEvents = {
      2: async () => {
        await triggerChoiceEvent(
          "A student named Riny Soh approaches you. He wants homework answers and threatens you for them.",
          [
            { label: "Ignore him", action: () => { gameState.royShinArc++; } },
            { label: "Give him the info", action: () => { gameState.friends++; gameState.cheatingRoyArc = true; updateFriendsUI();} },
          ]
        );
      },
      
      6: async () => {
        await triggerChoiceEvent(
          "A group of students asks you to join their study group chat. It seems sketchy.",
          [
            { label: "Join", action: () => { gameState.cheatingGCArc = true; gameState.friends += 5; updateFriendsUI();} },
            { label: "Decline", action: () => {} }
          ]
        );
      },
      9: async () => {
        renderer.schoolContent.appendChild(createFragment([
          span('', 'You forgot your calculator on the day of the first math project. You end up missing your first class to go back home and get it'),
          "\n\n"
        ]));
        gameState.absences++;
        updateAbsencesUI();

      },
      11: async () => {
        if (gameState.royShinArc === 1) {
          await triggerChoiceEvent(
            "Riny Soh sees you again in the halls. He tells you to \"run the faze in the restroom\", whatever that means.",
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
          if (renderer.hwCount) renderer.hwCount.textContent = gameState.homeworks;
        }     
      },
      14: async () => {
        
        if (gameState.cheatingRoyArc === true){
          gameState.isGameOver = true;
          renderer.schoolContent.appendChild(createFragment([
            span('', 'The admin found out that Riny Soh was cheating. He ended up snitching on you, and you get expelled.'),
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
          return true;
        }

        renderer.schoolContent.appendChild(createFragment([
          span('', 'Rumors spread of a group that knows all the test answers.'),
          '\n\n',
        ]));
      },
    16: async () => { 
      await triggerChoiceEvent(
          "A student starts arguing with the Bible teacher about morality in the Bible. The student looks around to see if anyone agrees.",
          [
            { label: "Join in the conversation", action: () => {gameState.wokeness = Math.min(100, gameState.wokeness + 10); updateFriendsUI();} },
            { label: "Support the Bible and debate her", action: () => {gameState.wokeness = Math.min(100, gameState.wokeness - 10); } },
            { label: "Ignore", action: () => {gameState.wokeness = Math.min(100, gameState.wokeness -5); } }
          ]
        );
      },
    18: async () => {
      await assembly([
          '--: The Pastor and the Principal wave to the audience.',
          'cc: The Pastor: Good morning! Our school counselors will start coming to your classes today to teach about college preparedness!',
          'tf: The Principal: Using our sponsored program, you will find out what your God-given gifts are!',
          '--: The chapel is dead silent.',
          'cc: The Pastor: Come on! You will enjoy this program for sure! Also, it is mandatory for all grades!'
        ]);
        renderer.schoolContent.appendChild(createFragment([
          span('', 'You end up getting more homework due to your class time being spent on multiple required personality tests (You got Woo and Input).'),
               '\n\n',
        ]));
          gameState.homeworks += 2;
          if (renderer.hwCount) renderer.hwCount.textContent = gameState.homeworks;
     }
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
    if (gameState.isGameOver) return;



    let testsToRetake = 0;

    // Absence system
    if (gameState.absences === 3 && !gameState.warned) {
      renderer.schoolContent.appendChild(createFragment([
        span('', 'The school pulled you out of class to warn you about your absences. Five unexcused absences will lead to suspension.' + (gameState.tests ? ' You end up missing your test(s) and will have to take them tomorrow.' : '')),
        '\n'
      ]));
      testsToRetake = gameState.tests;
      gameState.warned = true;
      updateAbsencesUI();
      await schoolContinue();
    } else if (gameState.absences >= 5) {
      updateAbsencesUI();
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
        '--: The Pastor waves to the audience.',
        'cc: Good morning! In order to build a more holy community, we want each and every one of you to go out and build bonds with three fellow disciples! Let\'s make this school like Heaven on Earth! If you don\'t, we will be concerned!'
      ]);
    
      if (renderer.grade && renderer.grade.parentNode) {
        // grade node, then text node "%", then we want FRIENDS
        const percentNode = renderer.grade.nextSibling; // the '%'
        const insertBeforeNode = percentNode ? percentNode.nextSibling : null;
    
        renderer.grade.parentNode.insertBefore(
          createFragment([
            ' ',
            span('friend-heading', 'FRIENDS'),
            ' ',
            renderer.friends = span(
              'friends',
              String(gameState.friends),
              null,
              'You need a minimum of 3 friends.'
            )
          ]),
          insertBeforeNode
        );
      }
    }

    gameState.hwRate += 0.3;


    let hwGain = Math.min(10, Math.floor(gameState.hwRate));
    gameState.homeworks += hwGain;
    if (renderer.hwCount) renderer.hwCount.textContent = gameState.homeworks;

    gameState.tests = Math.floor(Math.random() * 5) + testsToRetake;
    if (renderer.tests) renderer.tests.textContent = gameState.tests;

    gameState.testReadiness = 0;
    if (renderer.testReadiness) renderer.testReadiness.textContent = gameState.testReadiness;
    updateHomework();
    const totalHWGained = gameState.homeworks - hwBeforeSchool;

    renderer.schoolContent.appendChild(createFragment([
      span('', `You leave school with ${totalHWGained} more homework assignment(s) and ${gameState.tests} test(s) to prepare for tomorrow.`),
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
        "You have 0 friends left and your grade has fallen below 70%. It's only going to get worse from here. ",
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
              if (renderer.volunteerBtn) disableBtn(renderer.volunteerBtn, 'There\'s no school in the afterlife.');
              if (renderer.doHWBtn) disableBtn(renderer.doHWBtn, 'There\'s no school in the afterlife.');
              if (renderer.studyBtn) disableBtn(renderer.studyBtn, 'There\'s no school in the afterlife.');
              if (renderer.sleepBtn) disableBtn(renderer.sleepBtn, 'There\'s no school in the afterlife.');
            }
          }
          // {
          //   label: "I'm sick and twisted",
          //   action: async () => {
          //     renderer.schoolContent.appendChild(createFragment([
          //       '\n',
          //       span('', 'Blood spurts from a classmate\'s head. Screams echo across the classroom and spill out into the hall.'),
          //       '\n\n',
          //       span('', 'Your former classmates try to run, but they can\'t get very far. With you blocking the only doorway, the only way out is the realm of the Grim Reaper...'),
          //       '\n\n',
          //       span('', 'You move through the halls, going from classroom after classroom. They\'ll get you in the end, but what does it matter now?'),
          //       '\n\n',
          //       span('end-msg', 'ENDING: death'),
          //       '\n\n',
          //       span('the-end', 'GAME OVER'),
          //       '\n\n',
          //       span('button', '[try again]', clicks.reload)
          //     ]));
          //     if (renderer.volunteerBtn) disableBtn(renderer.volunteerBtn, 'There\'s no school in the afterlife.');
          //     if (renderer.doHWBtn) disableBtn(renderer.doHWBtn, 'There\'s no school in the afterlife.');
          //     if (renderer.studyBtn) disableBtn(renderer.studyBtn, 'There\'s no school in the afterlife.');
          //     if (renderer.sleepBtn) disableBtn(renderer.sleepBtn, 'There\'s no school in the afterlife.');
          //   }
          // }
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
          span('', 'Your parents stand at the door, visibly disappointed and angry. Your dad shakes his head and points away.'),
          '\n\n',
          span('end-msg', 'You have been disowned.'),
          '\n\n',
          span('the-end', 'GAME OVER'),
          '\n\n',
          span('button', '[try again]', clicks.reload)
        ]));
        renderer.schoolContBtn.classList.add('hidden');
        if (renderer.volunteerBtn) disableBtn(renderer.volunteerBtn, 'Find a family first!');
        if (renderer.doHWBtn) disableBtn(renderer.doHWBtn, 'Find a family first!');
        if (renderer.studyBtn) disableBtn(renderer.studyBtn, 'Find a family first!');
        if (renderer.sleepBtn) disableBtn(renderer.sleepBtn, 'Find a family first!');
        return;
      } else if (hoursLeft >= 3) {
        renderer.schoolContent.appendChild(createFragment([
          '\n',
          span('', 'Your parents enter your room, visibly disappointed and angry. They scold you for the entire night, and you are unable to study. They make it clear that there will be worse consequences if your grades continue to drop.'),
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

    if (renderer.sleepBtn) enableBtn(renderer.sleepBtn);
    
    if (renderer.school) renderer.school.classList.add('hidden');
    if (renderer.schoolContBtn) disableBtn(renderer.schoolContBtn);
    if (renderer.schoolContent) renderer.schoolContent.innerHTML = '';

    if (hoursLeft <= 0) addHours(0, true);
  }


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
    if (gameState.testReadiness > 100) {
        gameState.testReadiness = 100;
      }  
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
        'This is a very realistic portrayal of a Valley Christian Student. You will interact with the administration and students who represent the body of Christ; their actions are the hands and feet of Jesus (1 Corinthians 12:20). \n\nIn order to win, you must survive all 100 days of high school without letting your grades drop. Don\'t forget your community service... \n\nMany thanks to SheepTester and his original game: https://sheeptester.github.io/gunn-student-sim/ for inspiring this work.'
      ]));
    },

    showUpdates() {
      renderer.dialogHeading.textContent = 'UPDATES';
      renderer.dialogContent.appendChild(createFragment([
        '• i got it to work '
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
  updateDayCounterUI();
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
  updateAbsencesUI();
}

  window.clicks = clicks;

  window.startGame = function () {
    selectGender().then(() => {
      startAfterSchoolDay1();
    });
  };

  return [clicks];

})();
