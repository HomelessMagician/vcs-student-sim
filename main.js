const [clicks] = (() => {

const config = {
  MAX_SAT_STUDY: 50
};

const gameState = {
  accumulativeDay: 0,
  day: 0,
  time: 16,
  studySAT: 0,
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
  self: false,
  selfLength: 1,
  scolded: false,
  totalSAT: 0,
  absences: 0,
  warned: false,
  retakeTests: 0,
  avgSleepLength: null,
  reported: false,
  gender: 'they'
};

// Gender selection at startup
const selectedGender = prompt("Select gender (male/female/non-binary):", "non-binary");
if (selectedGender) gameState.gender = selectedGender.toLowerCase();

function updateHomework() {
  renderer.hwCount.textContent = gameState.homeworks;
  if (renderer.tests) {
    renderer.tests.textContent = gameState.tests;
    renderer.testReadiness.textContent = Math.round(gameState.testReadiness * 100) / 100;
    if (gameState.tests) enableBtn(renderer.studyBtn);
    else disableBtn(renderer.studyBtn, 'You don\'t have a test tomorrow!');
  }
  if (gameState.tests && gameState.testReadiness < 50) {
    disableBtn(renderer.studySATBtn, 'You should at least be 50% prepared for your test!');
  } else {
    enableBtn(renderer.studySATBtn);
  }
  if (gameState.homeworks === 0) {
    disableBtn(renderer.doHWBtn, 'No more homework!');
  } else {
    enableBtn(renderer.doHWBtn);
  }
  if (gameState.scolded) {
    disableBtn(renderer.studySATBtn, 'You cannot concentrate because your parents are scolding you.');
    disableBtn(renderer.studyBtn, 'You cannot concentrate because your parents are scolding you.');
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
  disableBtn(renderer.studySATBtn, 'You\'re at school!');
  disableBtn(renderer.doHWBtn, 'You\'re at school!');
  disableBtn(renderer.sleepBtn, 'You\'re at school!');
  if (renderer.studyBtn) disableBtn(renderer.studyBtn, 'You\'re at school!');
  if (gameState.scolded) gameState.scolded = false;
  gameState.accumulativeDay++;

  // 100-day Win Condition check
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
    await assembly([
      '--: You have successfully survived 100 days at school!',
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

  // Interactive Daily Events System
  const interactiveEvents = {
    10: async () => {
      await triggerChoiceEvent(
        "Someone left their lunch money on the cafeteria table. What do you do?",
        [
          { label: "Keep it (+2% grade)", action: () => { gameState.grade = Math.min(100, gameState.grade + 2); } },
          { label: "Give it to a worker (+1 Friend)", action: () => { gameState.friends++; } },
          { label: "Ignore it", action: () => {} }
        ]
      );
    },
    50: async () => {
      await triggerChoiceEvent(
        "Midterms are approaching fast. How do you study?",
        [
          { label: "Cram all night (+30 Test Readiness, -1 Sleep)", action: () => { gameState.testReadiness += 30; gameState.sleeplessNights++; } },
          { label: "Study normally (+10 Test Readiness)", action: () => { gameState.testReadiness += 10; } }
        ]
      );
    }
  };

  if (interactiveEvents[gameState.accumulativeDay]) {
    await interactiveEvents[gameState.accumulativeDay]();
  }
  

  if (gameState.accumulativeDay === 1) {
    document.body.insertBefore(createFragment([
      ' ',
      span('grade-heading', 'GRADE'),
      ' ',
      renderer.grade = span('grade', '100', null, 'Must be at least 90%'),
      '%'
    ]), renderer.gradeMarker);
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
    renderer.school.classList.remove('hidden');
    enableBtn(renderer.schoolContBtn);
  }
  let testsToRetake = 0;
  if (gameState.sleeplessNights > 2 && gameState.tests) {
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
  } else if (gameState.absences === 3 && !gameState.warned) {
    renderer.schoolContent.appendChild(createFragment([
      span('', 'The school pulled you out of class to warn you about your absence during the wellness program. They make it clear that five unexcused absences will lead to suspension.' + (gameState.tests ? ' You end up missing your test(s) from the talks and you\'ll have to take them tomorrow.' : '')),
      '\n'
    ]));
    testsToRetake = gameState.tests;
    gameState.warned = true;
    await schoolContinue();
  } else if (gameState.absences >= 5) {
    renderer.schoolContent.appendChild(createFragment([
      '\n',
      span('', 'You now have five unexcused absences. The school must follow the district policy.'),
      '\n\n',
      span('end-msg', 'You have been suspended.'),
      '\n\n',
      span('the-end', 'GAME OVER'),
      '\n\n',
      span('button', '[try again]', clicks.reload)
    ]));
    renderer.schoolContBtn.classList.add('hidden');
    renderer.studySATBtn.dataset.title = 'You aren\'t in school anymore!';
    renderer.doHWBtn.dataset.title = 'You aren\'t in school anymore!';
    renderer.studyBtn.dataset.title = 'You aren\'t in school anymore!';
    renderer.sleepBtn.dataset.title = 'You aren\'t in school anymore!';
    return;
  } else if (!gameState.reported && gameState.avgSleepLength < 3 && Math.random() < 0.2) {
    renderer.schoolContent.appendChild(createFragment([
      span('', 'The school pulled you out of class to interrogate you because one student reported you for looking exhausted.' + (gameState.tests ? ' You end up missing your test(s) from the talks and you\'ll have to take them tomorrow.' : '')),
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
  if (gameState.accumulativeDay === 1) {
    document.body.insertBefore(createFragment([
      '\n',
      renderer.studyBtn = span('button disabled', '[study for tests]', clicks.studyTest, 'You\'re at school!'),
      ' You are ',
      renderer.testReadiness = span('test-readiness', '0'),
      '% ready for ',
      renderer.tests = span('upcoming-tests', '0'),
      ' test(s) tomorrow.'
    ]), renderer.testStudyMarker);
  } else if (gameState.accumulativeDay === 2) {
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
  } else if (gameState.accumulativeDay === 3) {
    await assembly([
      '--: Representatives wave to the audience.',
      'cc: Today we are proud to announce our after-school wellness program!'
    ]);
    gameState.self = true;
  }
  gameState.hwRate += 0.3;
  gameState.homeworks += Math.floor(gameState.hwRate);
  renderer.hwCount.textContent = gameState.homeworks;
  gameState.tests = Math.floor(Math.random() * (gameState.hwRate/2)) + testsToRetake;
  renderer.tests.textContent = gameState.tests;
  let tempReadiness = gameState.testReadiness;
  gameState.testReadiness = 0;
  renderer.testReadiness.textContent = gameState.testReadiness;
  renderer.schoolContent.appendChild(createFragment([
    span('', `You leave school with ${Math.floor(gameState.hwRate)} more homework assignment(s) and ${gameState.tests} test(s) to prepare for tomorrow.`),
    '\n\n'
  ]));
  await schoolContinue();
  addHours(8);
  let hoursLeft = Math.ceil((gameState.time - 8) / 24) * 24 + 8 - gameState.time;
  if (gameState.self) {
    let resolve, promise = new Promise(res => resolve = res), opt1, opt2;
    renderer.schoolContBtn.classList.add('disabled');
    renderer.schoolContent.appendChild(createFragment([
      span('', `Go to after-school program?`),
      '\n',
      opt1 = span('button', '[ok]', () => resolve(true)),
      ' ',
      opt2 = span('button', '[no]', () => resolve(false)),
      '\n\n'
    ]));
    const answer = await promise;
    renderer.schoolContBtn.classList.remove('disabled');
    opt1.classList.add('disabled');
    opt2.classList.add('disabled');
    if (answer) {
      hoursLeft -= gameState.selfLength;
      addHours(gameState.selfLength);
    } else {
      if (gameState.absences === 0) {
        document.body.insertBefore(createFragment([
          ' ',
          span('absences-heading', 'ABSENCES', null, 'Don\'t miss the program!'),
          ' ',
          renderer.absences = span('absences', '0', null, 'Warning at 3 absences, suspension at 5.')
        ]), renderer.gradeMarker);
      }
      gameState.absences++;
      renderer.absences.textContent = gameState.absences;
    }
  }
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
              span('', 'Teachers run over to stop you, but it is too late. You climb over the fence and drop down from the conservatory roof.'),
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
              '\n\n'
              span('', 'Your former classmates try to run, but they can\'t get very far. With you blocking the only doorway, the only way out is the realm of the Grim Reaper...'),
              '\n\n'
              span('', 'You move through the halls, going from classroom after classroom. They\'ll get you in the end, but what does it matter now?'),
              '\n\n'
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
  enableBtn(renderer.sleepBtn);
  renderer.school.classList.add('hidden');
  disableBtn(renderer.schoolContBtn);
  renderer.schoolContent.innerHTML = '';
  if (hoursLeft <= 0) addHours(0, true);
}

const clicks = {
  studySAT() {
    gameState.studySAT++;
    gameState.totalSAT++;
    if (gameState.studySAT >= 50) {
      while (document.body.children.length) {
        if (document.body.lastChild !== this.floatingBar)
          document.body.removeChild(document.body.lastChild);
        else break;
      }
      document.body.appendChild(createFragment([
        renderer.schoolContent = span(),
        renderer.schoolContBtn = span('button', '[ok]', clicks.schoolContinue)
      ]));
      assembly([
        '--: You have completed all your study preparation books.',
        '--: You can now leave school behind.'
      ], 'GRADUATION').then(() => {
        document.body.removeChild(renderer.schoolContBtn);
        document.body.appendChild(createFragment([
          span('the-end', 'YOU WIN!'),
          '\n\n',
          span('button', '[play again]', clicks.reload)
        ]));
      });
      return;
    }
    switch (gameState.totalSAT) {
      case 1:
        document.body.appendChild(createFragment([
          ' You are now ',
          renderer.satPercent = span('sat-percentage', '2', null, 'Ready percentage'),
          '% ready.'
        ]));
        break;
      case 4:
        document.body.appendChild(createFragment([
          '\n',
          renderer.doHWBtn = span('button', '[do homework]', clicks.doHW),
          ' You have ',
          renderer.hwCount = span('homework-count', ''),
          ' homework assignment(s) due.',
          renderer.testStudyMarker = span('hidden'),
          '\n',
          renderer.sleepBtn = span('button', '[sleep]', clicks.sleep),
          ' Don\'t forget to sleep!'
        ]));
        gameState.homeworks += 3;
        updateHomework();
        gameState.time = 15;
        renderer.timeWrapper.classList.remove('hidden');
        break;
    }
    renderer.satPercent.textContent = 100 * gameState.studySAT / config.MAX_SAT_STUDY;
    addHours(1, true);
  },
  doHW() {
    gameState.homeworks--;
    updateHomework();
    addHours(1, true);
  },
  sleep() {
    const sleepLength = Math.ceil((gameState.time - 8) / 24) * 24 + 8 - gameState.time;
    addHours(sleepLength);
    gameState.sleeplessNights = 0;
    if (gameState.accumulativeDay === 0) {
      gameState.avgSleepLength = sleepLength;
    } else {
      gameState.avgSleepLength = (gameState.avgSleepLength * gameState.accumulativeDay + sleepLength) / (gameState.accumulativeDay + 1);
    }
    beginSchool();
  },
  schoolContinue() {
    if (gameState.continueResolve) {
      gameState.continueResolve();
      gameState.continueResolve = null;
    }
  },
  studyTest() {
    gameState.testReadiness += (Math.random() * 25 + 25) /gameState.tests;
    if (gameState.studySAT > 0) {
      gameState.studySAT--;
      renderer.satPercent.textContent = 100 * gameState.studySAT / config.MAX_SAT_STUDY;
    }
    updateHomework();
    addHours(1, true);
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
      'Survive 100 days of school by balancing academics, homework, and test prep.\n\n'
    ]));
  },
  showUpdates() {
    renderer.dialogHeading.textContent = 'UPDATES';
    renderer.dialogContent.appendChild(createFragment([
      'Custom 100-Day Simulator: Scores, leaderboards, and alternative modes removed.'
    ]));
  }
};

return [clicks];

})();
