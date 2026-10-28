using UnityEditor;
using UnityEditor.Rendering;
using UnityEngine;
using UnityEngine.Rendering.Universal;

// 프로젝트 생성 직후 한 번, 헤드리스로 실행한다.
//   unity run <프로젝트> -- -executeMethod ProjectSetup.Run
// 여기서 URP 머티리얼을 미리 업그레이드해 두면, 처음 Editor 창을 열 때 "URP material upgrade" 확인 창이 뜨지 않는다.
// 배치 모드는 이 메서드가 끝나면 종료하므로 비동기 작업(Client.Add 등)은 쓰지 않는다.
public static class ProjectSetup
{
    public static void Run()
    {
        var upgraders = MaterialUpgrader.FetchAllUpgradersForPipeline(typeof(UniversalRenderPipelineAsset));
        MaterialUpgrader.UpgradeProjectFolder(upgraders, "URP 머티리얼 업그레이드");
        AssetDatabase.SaveAssets();

        Debug.Log("[StarterKit] URP 머티리얼 업그레이드 완료");
    }
}
