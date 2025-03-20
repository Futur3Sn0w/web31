const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
const lightModeMediaQuery = window.matchMedia('(prefers-color-scheme: light)');
let windowPlaceholder = $('<div class="drag-placeholder"></div>');
var screensaverHTML = '<div class="screenSaver"><iframe src="" frameborder="0" class="ssEmbed"></iframe></div>';

$(document).ready(function () {
    updateFavicon();
    initializeLocalStorage();
    setupWallpaper();
    setupProgMan();

    $.toggleScreensaverFeature(5000, screensaverHTML);
    darkModeMediaQuery.addEventListener('change', updateFavicon);
    lightModeMediaQuery.addEventListener('change', updateFavicon);
});

// Localstorage setup

function initializeLocalStorage() {
    if (!localStorage.getItem('desktop')) {
        const defaultDesktop = {
            wallpaper: {
                pixelPattern: 'none',
                imagePattern: 'none',
                position: 'tile'
            },
            screensaver: {
                name: 'none',
                time: '2'
            },
            applications: {}
        };
        localStorage.setItem('desktop', JSON.stringify(defaultDesktop));
    }
}

function getDesktopSettings() {
    const desktopSettings = localStorage.getItem('desktop');
    return desktopSettings ? JSON.parse(desktopSettings) : {};
}

function saveDesktopSettings(settings) {
    localStorage.setItem('desktop', JSON.stringify(settings));
}

// Wallpaper & Patterns

function setupWallpaper() {

    const desktop = getDesktopSettings();

    const pixelPattern = desktop.wallpaper && desktop.wallpaper.pixelPattern || 'none';
    const imagePattern = desktop.wallpaper && desktop.wallpaper.imagePattern || 'none';
    const position = desktop.wallpaper && desktop.wallpaper.position;

    if (position === 'center') {
        $('.back .imgLayer').addClass('center');
    } else {
        $('.back .imgLayer').removeClass('center');
    }

    $('.back .patternLayer').attr('pattern', pixelPattern).css('background-image', `url('resc/patterns/pixel/${pixelPattern}.png')`);
    $('.back .imgLayer').attr('pattern', imagePattern).css('background-image', `url('resc/patterns/img/${imagePattern}.bmp')`);
}

// Screensaver

(function ($) {
    $.toggleScreensaverFeature = function (idleTime, screensaverHTML) {
        var localStorageKey = 'desktop';
        var idleTimer;
        var isIdle = false;
        var $currentScreensaver = null;

        var isScreensaverEnabled = function () {
            const desktop = getDesktopSettings();
            return desktop.screensaver && desktop.screensaver.name !== 'none';
        };

        var getScreensaverTime = function () {
            const desktop = getDesktopSettings();
            return desktop.screensaver && desktop.screensaver.time ? parseInt(desktop.screensaver.time) : 2;
        };

        var showScreensaver = function () {
            if (!isIdle && isScreensaverEnabled()) {
                $currentScreensaver = $(screensaverHTML);
                $('body').append($currentScreensaver);
                $currentScreensaver = $('.screenSaver');
                const desktop = getDesktopSettings();
                const screensaverName = desktop.screensaver.name;
                if (screensaverName !== 'none' && $currentScreensaver.find('.ssEmbed').length > 0) {
                    $currentScreensaver.find('.ssEmbed').attr('src', `resc/screensavers/${screensaverName}/index.html`);
                }
                isIdle = true;
            }
        };

        var hideScreensaver = function () {
            if (isIdle && $currentScreensaver) {
                $('.screenSaver').remove();
                $currentScreensaver = null;
                isIdle = false;
            }
        };

        var resetIdleTimer = function () {
            clearTimeout(idleTimer);
            hideScreensaver();
            if (isScreensaverEnabled()) {
                idleTimer = setTimeout(showScreensaver, getScreensaverTime() * 60000);
            }
        };

        $(document).on('mousemove keydown scroll', function () {
            resetIdleTimer();
        });

        $(window).on('storage', function (event) {
            if (event.key === localStorageKey) {
                updateScreensaverState();
            }
        });

        var updateScreensaverState = function () {
            if (isScreensaverEnabled()) {
                resetIdleTimer();
            } else {
                clearTimeout(idleTimer);
                hideScreensaver();
            }
        };

        updateScreensaverState();

        $(document).on('click', '.previewScreensaverBtn', function () {
            var $previewElement = $(screensaverHTML);
            $('body').append($previewElement);
            const desktop = getDesktopSettings();
            const screensaverName = desktop.screensaver.name;
            if (screensaverName !== 'none' && $previewElement.find('.ssEmbed').length > 0) {
                $previewElement.find('.ssEmbed').attr('src', `resc/screensavers/${screensaverName}/index.html`);
            }

            $(document).off('mousemove keydown scroll', resetIdleTimer);

            $(document).one('mousemove keydown scroll', function () {
                $previewElement.remove();
                $(document).on('mousemove keydown scroll', resetIdleTimer);
            });
        });
    };
}(jQuery));

// Favicon

function updateFavicon() {
    var favicon = $('#favicon');

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        if (!favicon.length) {
            $('head').append('<link id="favicon" rel="icon" href="resc/logo/white.svg" type="image/svg+xml">');
        } else {
            favicon.attr('href', 'resc/logo/white.svg');
        }
    } else {
        if (!favicon.length) {
            $('head').append('<link id="favicon" rel="icon" href="resc/logo/black.svg" type="image/svg+xml">');
        } else {
            favicon.attr('href', 'resc/logo/black.svg');
        }
    }
}

// Program manager setup

function setupProgMan() {
    $.getJSON('prog-dir.json', function (data) {
        var progman = data.programs.find(function (program) {
            return program.id === 'progman';
        });

        if (progman) {
            createWindow(progman);
            setTimeout(() => {
                var programs = data.programs;
                var programManagerInner = $('body').find('#progman .fullwindowhtml');
                var addedApps = {};
                var addedSubdirs = {};
                let menuItemCounter = 1;

                programs.forEach(function (program) {
                    if (program.subdirectory && !addedSubdirs[program.subdirectory]) {
                        var folderIcon = $('<div class="icon folder-icon" app-id="' + program.subdirectory + '">')
                            .html('<img src="resc/appIcons/folder.PNG" alt="' + program.subdirectory + '"><p>' + program.subdirectory.replace(/-/g, ' ') + '</p>');

                        // Load position from desktop object
                        var desktop = getDesktopSettings();
                        var iconPositions = desktop.iconPositions || {};
                        if (iconPositions[program.subdirectory]) {
                            folderIcon.css({ top: iconPositions[program.subdirectory].top, left: iconPositions[program.subdirectory].left });
                        }

                        folderIcon.draggable({
                            containment: "#progman .windowinner",
                            start: function (event, ui) {
                                folderIcon.addClass('dragging');
                            },
                            stop: function (event, ui) {
                                folderIcon.removeClass('dragging');
                                var pos = ui.position;
                                var iconId = folderIcon.attr('app-id');

                                var desktop = getDesktopSettings();
                                var iconPositions = desktop.iconPositions || {};
                                iconPositions[iconId] = { top: pos.top, left: pos.left };
                                desktop.iconPositions = iconPositions;
                                saveDesktopSettings(desktop);
                            }
                        });

                        let menuItem = $(`
                            <div class="menuItem appgroup" item="window${program.subdirectory}" for="${program.subdirectory}" name="${menuItemCounter}">
                            <p class="check">✓</p>
                            <p>${program.subdirectory.replace(/-/g, ' ')}</p>
                            </div>
                            `).on('mouseup', function () {
                            closeWindow($('.window.appgroup').attr('id'));
                            $('.folder-icon').removeClass('tempHide');
                            createSubdirectoryWindow(program.subdirectory);
                        });
                        $('#progman .contextMenu.windowMenu').append(menuItem);
                        menuItemCounter++;

                        folderIcon.data('subdirectory', program.subdirectory).attr('id', 'appGroupIcon-' + program.subdirectory);
                        programManagerInner.append(folderIcon);
                        addedSubdirs[program.subdirectory] = true;
                    }

                    if (!program.subdirectory && !addedApps[program.id]) {
                        let icon;
                        if (program.meta == true) {
                            icon = $('<div class="icon" app-id="' + program.id + '">')
                                .html('<img src="resc/appIcons/blank.PNG" alt="' + program.title + '"><p>' + program.title + '</p>');
                        } else {
                            icon = $('<div class="icon" app-id="' + program.id + '">')
                                .html('<img src="resc/appIcons/' + program.id + '.PNG" alt="' + program.title + '"><p>' + program.title + '</p>');
                        }
                        icon.data('program', program);

                        // Load position from desktop object
                        var desktop = getDesktopSettings();
                        var iconPositions = desktop.iconPositions || {};
                        if (iconPositions[program.id]) {
                            icon.css({ top: iconPositions[program.id].top, left: iconPositions[program.id].left });
                        }

                        icon.draggable({
                            containment: "#progman .windowinner",
                            start: function (event, ui) {
                                icon.addClass('dragging');
                            },
                            stop: function (event, ui) {
                                icon.removeClass('dragging');
                                var pos = ui.position;
                                var iconId = icon.attr('app-id');

                                var desktop = getDesktopSettings();
                                var iconPositions = desktop.iconPositions || {};
                                iconPositions[iconId] = { top: pos.top, left: pos.left };
                                desktop.iconPositions = iconPositions;
                                saveDesktopSettings(desktop);
                            }
                        });

                        if (program.hideIcon && program.hideIcon == true) {
                            icon.addClass('hide');
                        }

                        programManagerInner.append(icon);
                        addedApps[program.id] = true;
                    }
                });

                mainGroup();
            }, 150);
        } else {
            console.log('Entry not found');
        }
    });
}

// Open main app group

function mainGroup() {
    var subdirectory = $('#appGroupIcon-Main').data('subdirectory');
    createSubdirectoryWindow(subdirectory);
}

// Window time!

function createWindow(program) {
    var existingWindow = $('#' + program.id);
    if (existingWindow.length) {
        existingWindow.selectWindow();
    } else {
        let winWindowMinBtn = '<button class="windowButton minimize"><i>&#9660;</i></button>';
        let winWindowMaxBtn = '<button class="windowButton maximize"><i>&#9650;</i></button>';

        let winTop = "50px";
        let winLeft = "50px";
        let winWidth = "400px";
        let winHeight = "300px";

        let winStatic = '';
        let winMeta = '';
        let winEmbed = 'div';

        let winMenubar = '';

        if (program.windowOptions.size) {
            winWidth = program.windowOptions.size.width;
            winHeight = program.windowOptions.size.height;
        }

        if (program.windowOptions.position) {
            winTop = program.windowOptions.position.top;
            winLeft = program.windowOptions.position.left;
        }

        if (program.windowOptions.minimize == false) {
            winWindowMinBtn = '';
        }

        if (program.windowOptions.maximize == false) {
            winWindowMaxBtn = '';
        }

        if (program.windowOptions.static == true) {
            winStatic = 'static';
        }

        if (program.meta == true) {
            winMeta = 'meta';
        }

        if (program.embed == true) {
            winEmbed = 'iframe';
        }

        if (program.windowOptions.showMenuBar == true) {
            let menuBarItems = [];

            if (program.windowOptions.menuItems) {
                program.windowOptions.menuItems.forEach(menuItem => {
                    // Capitalize the first letter of the menuItem and add an underline
                    let capitalizedMenuItem = menuItem.charAt(0).toUpperCase() + menuItem.slice(1);
                    let underlinedMenuItem = capitalizedMenuItem.replace(capitalizedMenuItem.charAt(0), `<u>${capitalizedMenuItem.charAt(0)}</u>`);

                    menuBarItems.push(`<div class="menuBarItem" for="${menuItem}">${underlinedMenuItem}</div>`);
                });
            }

            winMenubar = `<div class="windowmenubar">${menuBarItems.join('')}</div>`;
        }

        var windowHTML =
            '<div id="' + program.id + `" class="window ${winStatic} ${winMeta}" app-id="` + program.id + `" style="position: absolute; top: ${winTop}; left: ${winLeft}; width: ${winWidth}; height: ${winHeight}; z-index: 1">`
            + '<div class="windowborder">'
            + '<div class="pick side_t pos_l"></div>'
            + '<div class="pick side_t pos_r"></div>'
            + '<div class="pick side_l pos_t"></div>'
            + '<div class="pick side_l pos_b"></div>'
            + '<div class="pick side_b pos_l"></div>'
            + '<div class="pick side_b pos_r"></div>'
            + '<div class="pick side_r pos_t"></div>'
            + '<div class="pick side_r pos_b"></div>'
            + '</div>'
            + '<div class="windowheader">'
            + '<div class="windowbuttons">'
            + winWindowMinBtn
            + winWindowMaxBtn
            + '</div>'
            + '<div class="windowButton windowControlBtn"></div>'
            + '<div class="windowtitle">' + program.title + '</div>'
            + '</div>'
            + winMenubar
            + '<div class="windowinner">'
            + `<${winEmbed} class="fullwindowhtml"></${winEmbed}>`
            + '</div>'
            + '</div>';


        $('body').append(windowHTML);
        $(`#${program.id}`).selectWindow();

        // Apply the functions to the new window
        var newWindow = $('#' + program.id);
        newWindow.draggable({
            handle: `.windowtitle`,
            containment: 'body',
            helper: function () {
                return windowPlaceholder.css({
                    width: newWindow.width(),
                    height: newWindow.height()
                });
            },
            drag: function (event, ui) {
                var placeholder = ui.helper;
                placeholder.addClass('drag-placeholder');
            },
            stop: function (event, ui) {
                var pos = ui.position;
                newWindow.css({ top: pos.top, left: pos.left });
            },
            cancel: ".windowControlBtn"
        })

        newWindow.find('.windowheader').on('dblclick', function () {
            windowMaximize(newWindow);
        });

        if (program.windowOptions.resize !== false) {
            newWindow.resizable({
                handles: "all",
                alsoresize: `#${program.id} .windowinner`,
                helper: '.drag-placeholder',
                start: function () {
                    $(`#${program.id}.selectedwindow`).addClass('freeze');
                    $('body').append(windowPlaceholder.css({ // Reuse the placeholder for resizing
                        width: newWindow.width(),
                        height: newWindow.height(),
                        position: 'absolute',
                        top: newWindow.css('top'),
                        left: newWindow.css('left'),
                        'z-index': 9999 // Ensure it's on top
                    }));
                },
                resize: function (event, ui) {
                    windowPlaceholder.css({
                        width: ui.size.width,
                        height: ui.size.height
                    });
                },
                stop: function () {
                    $('.window').removeClass('freeze');
                    windowPlaceholder.remove(); // Remove the placeholder after resizing
                }
            });
        } else {
            newWindow.addClass('noresize')
        }
        newWindow.find('.windowControlBtn').on("dblclick", function () {
            if (program.windowOptions.close !== false) {
                // $(this).parents('div.window').remove();
                closeWindow($(this).parents('.window.selectedwindow').attr('id'))
            }
        }).on("mousedown", function () {
            showWindowMenu(newWindow, program);
        });
        newWindow.mousedown(function () {
            $(this).selectWindow();
        });

        newWindow.find('.maximize').on('click', function () {
            windowMaximize(newWindow)
        });

        newWindow.find('.minimize').on('click', function () {
            newWindow.hide(); // Hide the window
            var icon = $('<div>')
                .addClass('icon')
                .html('<img src="resc/appIcons/' + program.id + '.PNG" alt="' + program.title + '"><p>' + program.title + '</p>')
                .on('dblclick', function () {
                    // Show the window and remove the icon
                    newWindow.show();
                    $(this).remove();
                });
            icon.data('program', program); // Store program data
            $('.minimizedApps').append(icon); // Append to body
        });

        newWindow.selectWindow(); // Bring to the top and select the new window

        // Construct the HTML path based on appId and fetch the content
        var htmlPath = 'resc/appPages/' + program.id + '.exe.html';
        if (program.embed == true) {
            if (program.embedOverride) {
                newWindow.find('.fullwindowhtml').attr('src', program.embedOverride + '.exe.html');
            } else {
                newWindow.find('.fullwindowhtml').attr('src', htmlPath);
            }
        } else {
            $.get(htmlPath, function (data) {
                newWindow.find('.fullwindowhtml').html(data);
            });
        }
    }
}

function createSubdirectoryWindow(subdirectory) {
    var existingWindow = $('#' + subdirectory);
    if (existingWindow.length) {
        existingWindow.selectWindow();
    } else {
        closeWindow($('#progman .window').attr('id'))
        var windowHTML = '<div id="' + subdirectory + '" class="window appgroup" app-id="' + subdirectory + '" style="position: absolute; top: 46px; left: 4px; width: 414px; height: 200px; z-index: 1">'
            + '<div class="windowborder">'
            + '<div class="pick side_t pos_l"></div>'
            + '<div class="pick side_t pos_r"></div>'
            + '<div class="pick side_l pos_t"></div>'
            + '<div class="pick side_l pos_b"></div>'
            + '<div class="pick side_b pos_l"></div>'
            + '<div class="pick side_b pos_r"></div>'
            + '<div class="pick side_r pos_t"></div>'
            + '<div class="pick side_r pos_b"></div>'
            + '</div>'
            + '<div class="windowheader">'
            + '<div class="windowbuttons">'
            + '<button class="windowButton minimize"><i>&#9660;</i></button>'
            + '<button class="windowButton maximize"><i>&#9650;</i></button>'
            + '</div>'
            + '<div class="windowButton windowControlBtn"></div>'
            + '<div class="windowtitle">' + subdirectory.replace(/-/g, ' ') + '</div>'
            + '</div>'
            + '<div class="windowinner">'
            + '<div class="fullwindowhtml"></div>'
            + '</div>'
            + '</div>';

        $('#progman .fullwindowhtml').append(windowHTML);
        $(`#${subdirectory}`).selectWindow();
        $(`.icon[app-id="${subdirectory}"]`).addClass('tempHide');

        // Apply the functions to the new window
        var newWindow = $('#' + subdirectory);
        newWindow.draggable({
            handle: `.windowtitle`,
            containment: '#progman .fullwindowhtml',
            helper: function () {
                return $('<div class="drag-placeholder"></div>').css({
                    width: newWindow.width(),
                    height: newWindow.height()
                });
            },
            drag: function (event, ui) {
                var placeholder = ui.helper;
                placeholder.addClass('drag-placeholder');
            },
            stop: function (event, ui) {
                var pos = ui.position;
                newWindow.css({ top: pos.top, left: pos.left });
            },
            cancel: ".windowControlBtn"
        });
        newWindow.resizable({
            handles: "all",
            alsoresize: `#${subdirectory} .windowinner`,
            helper: '.drag-placeholder',
            start: function () {
                $(`#${subdirectory}.selectedwindow`).addClass('freeze');
                $('body').append(windowPlaceholder.css({ // Reuse the placeholder for resizing
                    width: newWindow.width(),
                    height: newWindow.height(),
                    position: 'absolute',
                    top: newWindow.css('top'),
                    left: newWindow.css('left'),
                    'z-index': 9999 // Ensure it's on top
                }));
            },
            resize: function (event, ui) {
                windowPlaceholder.css({
                    width: ui.size.width,
                    height: ui.size.height
                });
            },
            stop: function () {
                $('.window').removeClass('freeze');
                windowPlaceholder.remove(); // Remove the placeholder after resizing
            }
        });
        newWindow.find('.windowControlBtn').on("dblclick", function () {
            $(`.icon[app-id="${subdirectory}"]`).removeClass('tempHide');
            // $(`#${subdirectory}`).remove();
            closeWindow(subdirectory)
        });
        newWindow.find('.windowControlBtn').on("mousedown", function () {
            showWindowMenu(newWindow, 'subdirectory');
        });
        newWindow.find('.minimize').on("click", function () {
            $(`.icon[app-id="${subdirectory}"]`).removeClass('tempHide');
            // $(`#${subdirectory}`).remove();
            closeWindow(subdirectory)
        });
        newWindow.find('.maximize').on('click', function () {
            windowMaximize(newWindow);
        });
        newWindow.find('.windowheader').on('dblclick', function () {
            windowMaximize(newWindow);
        });
        newWindow.mousedown(function () {
            $(this).selectWindow();
        });

        newWindow.selectWindow(); // Bring to the top and select the new window
        $('.menuItem.appgroup').removeClass('open');
        $(`.menuItem.appgroup[for="${subdirectory}"]`).addClass('open');

        // Add icons for programs in the subdirectory
        $.getJSON('prog-dir.json', function (data) {
            var programs = data.programs;
            var subdirectoryInner = $('#' + subdirectory + ' .fullwindowhtml');

            programs.forEach(function (program) {
                if (program.subdirectory === subdirectory) {
                    var icon = $('<div class="icon" app-id="' + program.id + '">')
                        .html('<img src="resc/appIcons/' + program.id + '.PNG" alt="' + program.title + '"><p>' + program.title + '</p>');

                    // Load position from desktop object
                    var desktop = getDesktopSettings();
                    var iconPositions = desktop.iconPositions || {};
                    if (iconPositions[program.id]) {
                        icon.css({ top: iconPositions[program.id].top, left: iconPositions[program.id].left });
                    }

                    icon.draggable({
                        containment: "#" + subdirectory + " .windowinner",
                        start: function (event, ui) {
                            icon.addClass('dragging');
                        },
                        stop: function (event, ui) {
                            icon.removeClass('dragging');
                            var pos = ui.position;
                            var iconId = icon.attr('app-id');

                            var desktop = getDesktopSettings();
                            var iconPositions = desktop.iconPositions || {};
                            iconPositions[iconId] = { top: pos.top, left: pos.left };
                            desktop.iconPositions = iconPositions;
                            saveDesktopSettings(desktop);
                        }
                    });

                    icon.data('program', program);
                    subdirectoryInner.append(icon);
                }
            });
        });
    }
}

function createAboutDialog(appId, winName) {
    const appWindow = $(`#${appId}`);
    if (!appWindow.length) {
        console.error(`App window with ID "${appId}" not found.`);
        return;
    }

    const appTitle = winName;
    const aboutDialogId = `about-${appId}`;

    // Check if the about dialog already exists
    if ($(`#${aboutDialogId}`).length) {
        $(`#${aboutDialogId}`).selectWindow();
        return;
    }

    const aboutDialogHTML = `
        <div id="${aboutDialogId}" class="window static about meta" app-id="${aboutDialogId}" style="position: absolute; top: 100px; left: 200px; width: 395px; height: 286px; z-index: 501;">
            <div class="windowborder"></div>
            <div class="windowheader">
            <div class="windowButton windowControlBtn"></div>
                <div class="windowtitle">About ${appTitle}</div>
            </div>
            <div class="windowinner">
                <iframe class="fullwindowhtml" src="resc/appPages/about.html?appName=${encodeURIComponent(appTitle)}&appId=${encodeURIComponent(appId)}"></iframe>
            </div>
        </div>
    `;

    $('body').append(aboutDialogHTML);
    const aboutDialog = $(`#${aboutDialogId}`);

    aboutDialog.draggable({
        handle: "div.windowheader",
        containment: 'body',
        helper: function () {
            return $('<div class="drag-placeholder"></div>').css({
                width: aboutDialog.width(),
                height: aboutDialog.height()
            });
        },
        drag: function (event, ui) {
            var placeholder = ui.helper;
            placeholder.addClass('drag-placeholder');
        },
        stop: function (event, ui) {
            var pos = ui.position;
            aboutDialog.css({ top: pos.top, left: pos.left });
        },
        cancel: ".windowControlBtn" // Prevent dragging on double-click
    });

    // Apply window functions
    aboutDialog.find('.windowControlBtn').on("dblclick", function () {
        // $(this).parents('div.window').remove();
        closeWindow(aboutDialog.attr('id'))
    });

    aboutDialog.mousedown(function () {
        $(this).selectWindow();
    });

    aboutDialog.selectWindow();

    window.addEventListener('message', function (event) {
        if (event.data.action === 'closeAboutDialog') {
            closeWindow(aboutDialog.attr('id'))
        }
    });
}

function createControlPanelAppletWindow(applet) {
    var existingWindow = $('#' + applet.id);
    if (existingWindow.length) {
        existingWindow.selectWindow();
    } else {
        let winTop = "100px";
        let winLeft = "200px";
        let winWidth = "500px";
        let winHeight = "400px";

        let winMeta = '';
        let winEmbed = 'div';

        let winMenubar = '';

        if (applet.windowOptions) {
            if (applet.windowOptions.size) {
                winWidth = applet.windowOptions.size.width;
                winHeight = applet.windowOptions.size.height;
            }

            if (applet.windowOptions.position) {
                winTop = applet.windowOptions.position.top;
                winLeft = applet.windowOptions.position.left;
            }
        }

        if (applet.meta == true) {
            winMeta = 'meta';
        }

        if (applet.embed == true) {
            winEmbed = 'iframe';
        }

        if (applet.windowOptions && applet.windowOptions.showMenuBar == true) {
            let menuBarItems = [];

            if (applet.windowOptions.menuItems) {
                applet.windowOptions.menuItems.forEach(menuItem => {
                    let capitalizedMenuItem = menuItem.charAt(0).toUpperCase() + menuItem.slice(1);
                    let underlinedMenuItem = capitalizedMenuItem.replace(capitalizedMenuItem.charAt(0), `<u>${capitalizedMenuItem.charAt(0)}</u>`);
                    menuBarItems.push(`<div class="menuBarItem" for="${menuItem}">${underlinedMenuItem}</div>`);
                });
            }

            winMenubar = `<div class="windowmenubar">${menuBarItems.join('')}</div>`;
        }

        var windowHTML =
            '<div id="' + applet.id + `" class="window static cpl ${winMeta}" app-id="` + applet.id + `" style="position: absolute; top: ${winTop}; left: ${winLeft}; width: ${winWidth}; height: ${winHeight}; z-index: 1">`
            + '<div class="windowborder"></div>'
            + '<div class="windowheader">'
            + '<div class="windowButton windowControlBtn"></div>'
            + '<div class="windowtitle">' + applet.title + '</div>'
            + '</div>'
            + '<div class="windowinner">'
            + `<${winEmbed} class="fullwindowhtml"></${winEmbed}>`
            + '</div>'
            + '</div>';

        $('body').append(windowHTML);
        $(`#${applet.id}`).selectWindow();

        var newWindow = $('#' + applet.id);

        newWindow.draggable({
            handle: `.windowtitle`,
            containment: 'body',
            helper: function () {
                return $('<div class="drag-placeholder"></div>').css({
                    width: newWindow.width(),
                    height: newWindow.height()
                });
            },
            drag: function (event, ui) {
                var placeholder = ui.helper;
                placeholder.addClass('drag-placeholder');
            },
            stop: function (event, ui) {
                var pos = ui.position;
                newWindow.css({ top: pos.top, left: pos.left });
            },
            cancel: ".windowControlBtn"
        });

        newWindow.find('.windowControlBtn').on("dblclick", function () {
            if (applet.windowOptions && applet.windowOptions.close !== false) {
                closeWindow($(this).parents('.window.selectedwindow').attr('id'))
            }
        }).on("mousedown", function () {
            showWindowMenu(newWindow, applet);
        });
        newWindow.mousedown(function () {
            $(this).selectWindow();
        });

        var htmlPath = 'resc/control/cpls/' + applet.id + '.cpl.html';
        if (applet.embed == true) {
            newWindow.find('.fullwindowhtml').attr('src', htmlPath);
        } else {
            $.get(htmlPath, function (data) {
                newWindow.find('.fullwindowhtml').html(data);
            });
        }
    }
}

function startProgram(appId) {
    $.getJSON('prog-dir.json', function (data) {
        data.programs.forEach(function (program) {
            if (program.id == appId) {
                createWindow(program)
            }
        });
    });
}

// In-window functions

function closeWindow(window) {
    $(`#${window}:not(#progman)`).remove();
}

function windowMaximize(newWindow) {
    let targetWindow = newWindow;
    // let targetWindow = $(`#${program.id}`);
    if (targetWindow.hasClass('maximized')) {
        // Restore the window
        targetWindow.removeClass('maximized').css({
            top: targetWindow.data('original-top'),
            left: targetWindow.data('original-left'),
            width: targetWindow.data('original-width'),
            height: targetWindow.data('original-height')
        });
    } else {
        // Maximize the window
        targetWindow.data({
            'original-top': targetWindow.css('top'),
            'original-left': targetWindow.css('left'),
            'original-width': targetWindow.css('width'),
            'original-height': targetWindow.css('height')
        }).addClass('maximized').css({
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
        });
    }
}

// Window click-to-bring-to-top function
(function () {
    var highest = 500;
    $.fn.selectWindow = function () {
        // Make top
        this.css('z-index', ++highest);
        // Make this window selected and others not
        $('.window.static:not(.about):not(.cpl)').not(this).remove();
        $('.window').removeClass('selectedwindow');
        this.addClass('selectedwindow');
        setTimeout(() => {
            if ($('.window.selectedwindow').find('.icon p.highlight').length <= 0) {
                $('.window:not(.selectedwindow)').find('.icon p').removeClass('highlight');
                $('.window.selectedwindow').find('.icon:not(.hide)').first().children('p').addClass('highlight');
            }
        }, 50);
    };
})();

// Icon clicks
$(document).on('mousedown', '.icon', function () {
    $('.icon p').removeClass('highlight');
    $(this).find('p').addClass('highlight');
});

$(document).on('dblclick', '.icon', function () {
    var program = $(this).data('program');
    var subdirectory = $(this).data('subdirectory');
    var cpl = $(this).data('applet')

    if ($(this).children('p').hasClass('highlight')) {
        if (subdirectory) {
            closeWindow($('.window.appgroup').attr('id'));
            $('.folder-icon').removeClass('tempHide')
            createSubdirectoryWindow(subdirectory);
        } else if (program) {
            createWindow(program);
        } else if (cpl) {
            createControlPanelAppletWindow(cpl)
        }
    }
});

// Body click 
$(document).on('dblclick', '.back', function (e) {
    startTaskMan();
    e.stopPropagation();
})

// Taskman 

function startTaskMan() {
    var program = $('.icon[app-id="taskman"]').data('program');
    createWindow(program);

    setTimeout(() => {
        $('.window:not(.meta)').each(function () {
            // Create a new div element
            var newDiv = $('<div></div>').addClass('running-app-item')
                .attr('windowid', $(this).attr('id'))
                .text($(this).find('.windowtitle').text())
                .on('click', function () {
                    $('.running-app-item').removeClass('selected');
                    $(this).addClass('selected');
                })
                .on('dblclick', function () {
                    $("#" + $(this).attr('windowid')).selectWindow();
                });

            // Append the new div to the tasklist div
            $('.tasklist').append(newDiv);
        });
    }, 100);
}

// Window control menu

function showWindowMenu(newWindow, program) {
    if ($('.window .windowControlMenu').length) {
        $('.window .windowControlMenu').remove();
    } else {
        let wcm = $('.windowControlMenu').clone();
        if (program == 'subdirectory') {
        } else {
            if ($('.window.selectedwindow').hasClass('maximized')) {
                wcm.children('.windowMenuItem[name="Maximize"]').addClass('disabled')
                wcm.children('.windowMenuItem[name="Restore"]').removeClass('disabled')
            } else {
                wcm.children('.windowMenuItem[name="Maximize"]').removeClass('disabled')
                wcm.children('.windowMenuItem[name="Restore"]').addClass('disabled')
            }
        }
        wcm.appendTo(newWindow);
    }
}

$(window).click(function (event) {
    if (!$(event.target).is('.windowControlMenu') && !$(event.target).is('.windowControlBtn')) {
        $('.window .windowControlMenu').remove();
    }
});

$(document).on('mouseup click', '.windowMenuItem[name="Minimize"]', () => {
    $(".window.selectedwindow").find('.minimize').click();
})

$(document).on('mouseup click', '.windowMenuItem[name="Maximize"]', () => {
    $(".window.selectedwindow").find('.maximize').click();
})

$(document).on('mouseup click', '.windowMenuItem[name="Close"]', () => {
    // $(".window.selectedwindow:not(.meta)").remove();
    $(this).parent('.window.selectedwindow')
    closeWindow($('.window.selectedwindow').attr('id'));

})
$(document).on('mouseup', '.contextMenu .menuItem[item="helpAbout"]', (e) => {
    let selectedWindowId;
    let selectedWindowName;
    let parentWindowId = $(e.target).parents('.window').attr('id');

    if (parentWindowId && parentWindowId.includes('progman')) {
        selectedWindowId = 'progman';
        selectedWindowName = 'Program Manager';
    } else {
        selectedWindowId = $(e.target).parents('.window.selectedwindow').attr('id');
        selectedWindowName = $('.window.selectedwindow .windowtitle').text();
    }

    if (selectedWindowId) {
        createAboutDialog(selectedWindowId, selectedWindowName);
    } else {
        console.error("Could not find selected window id.")
    }

});

// Menubar (file, edit, help, etc)

$(document).on('mousedown click', '.windowmenubar .menuBarItem', (e) => {
    $('.contextMenu').removeClass('show');
    let mbFor = $(e.target).attr('for');
    var sourceLeft = $(e.target).position().left;
    if ($('.window.selectedwindow').has('iframe').length) {
        const embeddedWindow = $('.window.selectedwindow iframe')[0].contentWindow;

        if (embeddedWindow) {
            // Use plain JavaScript to find and toggle the class
            embeddedWindow.eval(`
                    let contextMenus = document.querySelectorAll('.contextMenu[for="${mbFor}"]');
                    contextMenus.forEach(menu => {
                        menu.classList.toggle('show');
                        menu.style.left = 'calc(${sourceLeft}px)';
                    });
                `);

            $(window).click(function (event) {
                if (!$(event.target).is('iframe') && !$(event.target).is('.menuBarItem')) {
                    embeddedWindow.eval(`
                            let contextMenus = document.querySelectorAll('.contextMenu[for="${mbFor}"]');
                            contextMenus.forEach(menu => {
                                menu.classList.remove('show');
                            });
                        `);
                }
            });
        } else {
            console.error('Could not access contentWindow of embed element.');
        }
    } else {
        $(".window.selectedwindow").find(`.contextMenu[for="${mbFor}"]`).toggleClass('show').css('left', `calc(${sourceLeft}px)`);

        $(window).click(function (event) {
            if (!$(event.target).is('.contextMenu') && !$(event.target).is('.menuBarItem')) {
                $('.window .contextMenu').removeClass('show');
            }
        });
    }
});