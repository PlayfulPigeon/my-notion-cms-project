using System.Collections.Generic;
using UnityEditor;
using UnityEditor.PackageManager;
using UnityEditor.PackageManager.Requests;
using UnityEngine;

// 첫 Editor 실행 때 Multiplayer Center 패키지의 최신 호환 버전을 설치하고 Multiplayer Center 창을 연다.
// 도메인 리로드 때 진행 상태가 사라지므로, 설치가 끝나지 않았으면 리로드 후 다시 시작한다.
// 다시 실행하려면 메뉴 Tools > Starter Kit > Install Multiplayer Packages 를 누른다.
[InitializeOnLoad]
public static class MultiplayerPackageInstaller
{
    const string DoneKey = "StarterKit.MultiplayerPackagesInstalled";
    const string CenterMenu = "Window/Multiplayer/Multiplayer Center";

    static readonly string[] Packages =
    {
        "com.unity.multiplayer.center",
        "com.unity.services.multiplayer",
        "com.unity.netcode.gameobjects",
    };

    static readonly List<SearchRequest> Searches = new List<SearchRequest>();
    static readonly List<AddRequest> Requests = new List<AddRequest>();

    static MultiplayerPackageInstaller()
    {
        if (Application.isBatchMode || EditorPrefs.GetBool(DoneKey, false))
        {
            return;
        }

        EditorApplication.delayCall += Install;
    }

    [MenuItem("Tools/Starter Kit/Install Multiplayer Packages")]
    public static void Install()
    {
        if (Searches.Count > 0 || Requests.Count > 0)
        {
            return;
        }

        foreach (var package in Packages)
        {
            Searches.Add(Client.Search(package));
        }

        EditorApplication.update += PollSearch;
    }

    // 레지스트리에서 각 패키지의 최신 호환 버전을 찾는다.
    static void PollSearch()
    {
        foreach (var search in Searches)
        {
            if (!search.IsCompleted)
            {
                return;
            }
        }

        EditorApplication.update -= PollSearch;

        for (var i = 0; i < Searches.Count; i++)
        {
            Requests.Add(Client.Add(Packages[i] + LatestVersionSuffix(Searches[i], Packages[i])));
        }

        Searches.Clear();
        EditorApplication.update += PollAdd;
    }

    // 검색에 실패하면 버전 없이 설치한다.
    static string LatestVersionSuffix(SearchRequest search, string packageName)
    {
        if (search.Status != StatusCode.Success)
        {
            return "";
        }

        foreach (var info in search.Result)
        {
            if (info.name != packageName)
            {
                continue;
            }

            var version = info.versions.latestCompatible ?? info.versions.latest;
            return string.IsNullOrEmpty(version) ? "" : "@" + version;
        }

        return "";
    }

    static void PollAdd()
    {
        foreach (var request in Requests)
        {
            if (!request.IsCompleted)
            {
                return;
            }
        }

        EditorApplication.update -= PollAdd;

        var allOk = true;
        foreach (var request in Requests)
        {
            if (request.Status == StatusCode.Success)
            {
                Debug.Log($"[StarterKit] 설치 완료: {request.Result.packageId}");
            }
            else
            {
                allOk = false;
                Debug.LogError($"[StarterKit] 설치 실패: {request.Error?.message}");
            }
        }

        Requests.Clear();

        if (allOk)
        {
            EditorPrefs.SetBool(DoneKey, true);
            EditorApplication.ExecuteMenuItem(CenterMenu);
            Debug.Log("[StarterKit] 멀티플레이어 패키지 준비 완료. 열린 Multiplayer Center에서 게임 종류를 선택하세요.");
        }
    }
}
