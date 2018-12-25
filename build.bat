set msBuildDir=d:\Program Files\VisualStudio\MSBuild\15.0\Bin\

call "%msBuildDir%\msbuild.exe"  VkAppHome.sln /p:Configuration=Release /l:FileLogger,Microsoft.Build.Engine;logfile=Manual_MSBuild_ReleaseVersion_LOG.log

rd .\BuildResults /S /Q
md .\BuildResults

XCOPY .\VkApp.Web\bin\*.* .\BuildResults\bin\ /S
XCOPY .\VkApp.Web\app\*.* .\BuildResults\app\ /S
XCOPY .\VkApp.Web\Content\*.* .\BuildResults\Content\ /S
XCOPY .\VkApp.Web\jquery\*.* .\BuildResults\jquery\ /S
XCOPY .\VkApp.Web\Views\*.* .\BuildResults\Views\ /S

XCOPY .\VkApp.Web\*.asax .\BuildResults\
XCOPY .\VkApp.Web\*.config .\BuildResults\
XCOPY .\VkApp.Web\*.ico .\BuildResults\

cd BuildResults
call "c:\Program Files\7-Zip\7z.exe" a wwwroot.zip 
pause
